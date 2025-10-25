const User = require('../models/User');
const Request = require('../models/request');
const transporter = require('../controllers/mailControllers');
const { gfs, upload, multerErrorHandler } = require('../config/gridfs');
const mongoose = require('mongoose');

const submitRequest = async (req, res) => {
  try {
    const {
      email,
      documentTitle,
      authors,
      publicationName,
      publicationYear,
      volumeNo,
      issueNo,
      pageRange,
      sourceUrl,
      publisher
    } = req.body;

    const requiredFields = [
      email,
      documentTitle,
      authors,
      publicationName,
      publicationYear,
      volumeNo,
      sourceUrl,
      publisher
    ];
    if (requiredFields.some(field => !field)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.email !== req.user.email) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const newRequest = {
      email,
      documentTitle,
      authors,
      publicationName,
      publicationYear,
      volumeNo,
      issueNo,
      pageRange,
      sourceUrl,
      publisher
    };

    user.requests.push(newRequest);
    await user.save();

    const createdRequest = user.requests[user.requests.length - 1];
    const metaId = createdRequest._id.toString();

    const request = new Request({
      email: email,
      documentTitle: documentTitle,
      authors: authors,
      publicationName: publicationName,
      publicationYear: publicationYear,
      volumeNo: volumeNo,
      issueNo: issueNo,
      pageRange: pageRange,
      sourceUrl: sourceUrl,
      publisher: publisher,
      metaId: metaId
    });
    await request.save();

    res.status(201).json({ message: 'Request submitted successfully', request: newRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const fetchRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('requests');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Sort user's requests by createdAt (newest first)
    const sortedRequests = [...user.requests].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json(sortedRequests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching requests' });
  }
};


const fetchAllRequest = async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateRequestStatus = async (req, res) => {
  const { id } = req.params;

  // Debug: Log req.body and req.file
  console.log('req.body:', req.body);
  console.log('req.file:', req.file);

  // Check if req.body is undefined or empty
  if (!req.body) {
    return res.status(400).json({ message: 'Request body is missing or undefined' });
  }

  const { status, rejectReason } = req.body;
  const validStatuses = ['processing', 'pending', 'accepted', 'rejected'];
  const validRejectionReasons = ['Already Subscribed', 'Available', 'Open Access', 'Not Available', 'Invalid Request'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid or missing status value' });
  }

  if (status === 'rejected' && (!rejectReason || !validRejectionReasons.includes(rejectReason))) {
    return res.status(400).json({ message: 'Invalid or missing rejection reason' });
  }

  if (status === 'accepted' && !req.file) {
    return res.status(400).json({ message: 'PDF file is required for approval' });
  }

  try {
    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = status;
    if (status === 'rejected') {
      request.rejectReason = rejectReason;
      request.pdfFileId = null;
    } else if (status === 'accepted' && req.file) {
      // If using memoryUpload, req.file will contain a buffer we can write
      // to GridFS. Ensure we have a GridFSBucket; if the exported `gfs` is not
      // yet initialized, create one from mongoose.connection.db.
      const gfsBucket = gfs || (mongoose.connection && mongoose.connection.db
        ? new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' })
        : null);

      if (req.file && req.file.buffer && gfsBucket) {
        const uploadStream = gfsBucket.openUploadStream(req.file.originalname, {
          contentType: req.file.mimetype,
          metadata: { originalname: req.file.originalname, fieldname: req.file.fieldname },
        });

        // Write buffer and await finish to get file id
        await new Promise((resolve, reject) => {
          uploadStream.on('error', (err) => {
            console.error('GridFS upload stream error:', err);
            reject(err);
          });
          uploadStream.on('finish', () => resolve());
          // write buffer
          uploadStream.end(req.file.buffer);
        }).catch((err) => {
          console.error('Error writing file to GridFS:', err);
          return res.status(500).json({ message: 'Uploaded file could not be saved' });
        });

        const fileId = uploadStream.id;
        if (!fileId) {
          console.error('GridFS upload did not yield an id', req.file);
          return res.status(500).json({ message: 'Uploaded file could not be saved' });
        }

        request.pdfFileId = fileId.toString();
        request.rejectReason = null;
      } else {
        console.error('No file buffer available or GridFS not initialized', req.file);
        return res.status(500).json({ message: 'Uploaded file could not be saved' });
      }
    } else {
      request.rejectReason = null;
      request.pdfFileId = null;
    }
    await request.save();

    const user = await User.findOne({ 'requests._id': request.metaId });
    if (!user) {
      return res.status(400).json({ message: 'User with this request not found' });
    }

    const embeddedRequest = user.requests.id(request.metaId);
    if (!embeddedRequest) {
      return res.status(400).json({ message: 'Embedded request not found in user data' });
    }

    embeddedRequest.status = status;
    embeddedRequest.rejectReason = status === 'rejected' ? rejectReason : null;
    if (status === 'accepted' && req.file) {
      // embeddedRequest should mirror the main request.pdfFileId
      embeddedRequest.pdfFileId = request.pdfFileId;
    } else {
      embeddedRequest.pdfFileId = null;
    }
    await user.save();

    let emailText = `Dear User,\n\nYour document request for "${request.documentTitle}" has been updated to "${status}".`;
    let emailHtml = `
      <h2>Document Request Status Update</h2>
      <p>Dear User,</p>
      <p>Your document request for <strong>"${request.documentTitle}"</strong> has been updated to <strong>${status}</strong>.</p>
    `;

    if (status === 'rejected') {
      emailText += `\nReason: ${rejectReason}`;
      emailHtml += `<p>Reason: <strong>${rejectReason}</strong></p>`;
    } else if (status === 'accepted' && req.file) {
      emailText += `\nThe document has been uploaded and is available for download.`;
      emailHtml += `<p>The document has been uploaded and is available for download.</p>`;
    }

    emailText += `\n\nThank you,\nLibraryX Team`;
    emailHtml += `<p>Thank you,<br>LibraryX Team</p>`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Document Request Status Update: ${request.documentTitle}`,
      text: emailText,
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${user.email} for request ${id}`);

    res.json({
      message: 'Request status updated successfully',
      globalRequest: request,
      userRequest: embeddedRequest,
    });
  } catch (error) {
    console.error('Error updating request status or sending email:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getGFS = () => {
  if (!mongoose.connection || !mongoose.connection.db) {
    throw new Error('MongoDB connection not ready');
  }
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads',
  });
};

const getFile = async (req, res) => {
  try {
    const gfs = getGFS(); // dynamically create GridFSBucket
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);
    const downloadStream = gfs.openDownloadStream(fileId);

    downloadStream.on('error', () => {
      res.status(404).json({ message: 'File not found' });
    });

    res.set('Content-Type', 'application/pdf');
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error retrieving file:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateInfo = async (req, res) => {
  try {
    const { requestId } = req.params;
    const {
      documentTitle,
      authors,
      publicationName,
      publisher,
      publicationYear,
      volumeNo,
      issueNo,
      pageRange,
      sourceUrl,
    } = req.body;

    // Validate requestId
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Invalid request ID' });
    }

    // Validate required fields
    if (
      !documentTitle ||
      !authors ||
      !publicationName ||
      !publisher ||
      !publicationYear ||
      !volumeNo ||
      !sourceUrl
    ) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Validate publicationYear
    const year = parseInt(publicationYear, 10);
    if (isNaN(year) || year < 1800 || year > new Date().getFullYear() + 1) {
      return res.status(400).json({ message: 'Invalid publication year' });
    }

    // Validate sourceUrl
    try {
      new URL(sourceUrl);
    } catch {
      return res.status(400).json({ message: 'Invalid source URL' });
    }

    // Find the request in the Request collection
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Prepare update data
    const updateData = {
      documentTitle,
      authors,
      publicationName,
      publisher,
      publicationYear: year,
      volumeNo,
      issueNo: issueNo || null,
      pageRange: pageRange || null,
      sourceUrl,
    };

    // Update the Request collection
    const updatedRequest = await Request.findByIdAndUpdate(
      requestId,
      updateData,
      { new: true }
    );

    // Find the user with matching email
    const user = await User.findOne({ email: request.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find and update the request in the user's requests array using metaId
    const requestIndex = user.requests.findIndex(
      (req) => req._id.toString() === request.metaId.toString()
    );
    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Request not found in user\'s requests array' });
    }

    user.requests[requestIndex] = {
      ...user.requests[requestIndex].toObject(),
      ...updateData,
    };

    await user.save();

    res.status(200).json({
      message: 'Request updated successfully',
      request: updatedRequest,
    });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitRequest,
  fetchRequest,
  updateInfo,
  fetchAllRequest,
  updateRequestStatus,
  getFile,
  multerErrorHandler
};