const express = require('express');

const router = express.Router();
const { submitRequest } = require('../controllers/requestController');
const { fetchRequest } = require('../controllers/requestController');
const { fetchAllRequest } = require('../controllers/requestController');
const { updateRequestStatus} = require('../controllers/requestController');
const { verifyAccessToken} = require('../middlewares/auth');

router.post('/submit', verifyAccessToken, submitRequest);
router.get('/', verifyAccessToken, fetchRequest);
router.get('/all', verifyAccessToken, fetchAllRequest);
router.patch('/:id', verifyAccessToken, updateRequestStatus); // New endpoint for status updates


module.exports = router;