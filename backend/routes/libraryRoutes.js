const express = require('express');
const router = express.Router();
const { verifyAccessToken } = require('../middlewares/auth');
const { addLibrary, fetchLibrary, sendMail, fetchRequests } = require('../controllers/libraryController');

// POST: Add a new library
router.post('/add', verifyAccessToken, addLibrary);
// GET: Fetch all libraries
router.get('/fetch', verifyAccessToken, fetchLibrary);
// POST: Send emails to selected libraries
router.post('/:requestId/send-emails', verifyAccessToken, sendMail);
// GET: Fetch requests for a specific library
router.get('/:libraryId/requests', verifyAccessToken, fetchRequests);
module.exports = router;