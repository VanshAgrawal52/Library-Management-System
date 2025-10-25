const Library = require('../models/library');
const transporter = require('../controllers/mailControllers');
const Request = require('../models/request');

// POST: Add a new library
const addLibrary = async (req, res) => {
  try {
    const { name, email, contactPersonName, contactPhoneNo, contactAddress, remarks } = req.body;

    // Create new library instance
    const library = new Library({
      name,
      email,
      contactPersonName,
      contactPhoneNo,
      contactAddress,
      remarks,
    });

    // Save to database
    const savedLibrary = await library.save();
    res.status(201).json({
      message: 'Library added successfully',
      library: savedLibrary,
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error adding library',
      error: error.message,
    });
  }
};

// GET: Fetch all libraries
const fetchLibrary = async (req, res) => {
  try {
    const libraries = await Library.find();
    res.status(200).json({
      message: 'Libraries fetched successfully',
      libraries,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching libraries',
      error: error.message,
    });
  }
};

// POST: Send emails to selected libraries
const sendMail = async (req, res) => {
  const { requestId } = req.params;
  const { libraryIds } = req.body; // Array of selected library IDs

  try {
    // Fetch the request
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Fetch selected libraries
    const libraries = await Library.find({ _id: { $in: libraryIds } });
    if (libraries.length === 0) {
      return res.status(400).json({ message: 'No valid libraries selected' });
    }

    // Prepare email content and update libraries
    const emailPromises = libraries.map(async (library) => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: library.email,
        subject: `Document Request: ${request.documentTitle}`,
        html: `
          <h3>Dear ${library.contactPersonName || 'Library Staff'},</h3>
          <p>We are requesting the following document from your library:</p>
          <h4>Document Details:</h4>
          <ul>
            <li><strong>Title:</strong> ${request.documentTitle}</li>
            <li><strong>Authors:</strong> ${request.authors}</li>
            <li><strong>Publication:</strong> ${request.publicationName}</li>
            <li><strong>Publisher:</strong> ${request.publisher}</li>
            <li><strong>Year:</strong> ${request.publicationYear}</li>
            ${request.volumeNo ? `<li><strong>Volume:</strong> ${request.volumeNo}</li>` : ''}
            ${request.issueNo ? `<li><strong>Issue:</strong> ${request.issueNo}</li>` : ''}
            ${request.pageRange ? `<li><strong>Page Range:</strong> ${request.pageRange}</li>` : ''}
            ${request.sourceUrl ? `<li><strong>Source URL:</strong> <a href="${request.sourceUrl}">${request.sourceUrl}</a></li>` : ''}
          </ul>
          <p>Please let us know the availability of this document or any further steps required to fulfill this request.</p>
          <p>Best regards,<br>LibraryX Admin Team</p>
        `,
      };

      // Update library to include this request
      await Library.updateOne(
        { _id: library._id },
        { $addToSet: { requests: requestId } } // $addToSet prevents duplicates
      );

      return transporter.sendMail(mailOptions);
    });

    // Send all emails and wait for completion
    await Promise.all(emailPromises);

    res.status(200).json({ message: 'Emails sent successfully and requests stored in libraries' });
  } catch (error) {
    console.error('Error sending emails or updating libraries:', error);
    res.status(500).json({ message: 'Failed to send emails or store requests', error: error.message });
  }
};

// GET: Fetch requests for a specific library
const fetchRequests = async (req, res) => {
  const { libraryId } = req.params;

  try {
    const library = await Library.findById(libraryId).populate('requests');
    if (!library) {
      return res.status(404).json({ message: 'Library not found' });
    }

    res.status(200).json({
      message: 'Requests fetched successfully',
      requests: library.requests,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching requests for library',
      error: error.message,
    });
  }
};

module.exports = { addLibrary, fetchLibrary, sendMail, fetchRequests};