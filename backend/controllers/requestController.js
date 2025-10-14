// Snippet 5: controllers/requestController.js - Controller to handle request submission
const User = require('../models/User');
const Request = require('../models/Request');

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

    // Validate required fields (email not needed here, using from token)
    const requiredFields = [
      email,
      //   requesterName, patronCategory, department,
      documentTitle, authors, publicationName, publicationYear,
      volumeNo, sourceUrl, publisher
    ];
    if (requiredFields.some(field => !field)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find user by ID from token (assuming req.user.id is the _id)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email in token matches user's email (security)
    if (user.email !== req.user.email) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Create new request object
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

// GET requests for the logged-in user
const fetchRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('requests');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.requests); // send only requests array
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
  const { id } = req.params; // id = Request document _id
  const { status } = req.body;
  const validStatuses = ['processing', 'pending', 'accepted', 'rejected'];

  // Validate status
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    //  Find the request in the Request collection
    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Update the main Request collection
    request.status = status;
    await request.save();

    // Find the user that owns this request using metaId
    // metaId in Request = _id of embedded request inside User
    const user = await User.findOne({ 'requests._id': request.metaId });
    if (!user) {
      return res.status(404).json({ message: 'User with this request not found' });
    }

    // Find the specific embedded request inside the user
    const embeddedRequest = user.requests.id(request.metaId);
    if (!embeddedRequest) {
      return res.status(404).json({ message: 'Embedded request not found in user data' });
    }

    // Update its status too
    embeddedRequest.status = status;
    await user.save();

    res.json({
      message: 'Request status updated successfully',
      globalRequest: request,
      userRequest: embeddedRequest
    });

  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { submitRequest, fetchRequest, fetchAllRequest, updateRequestStatus };