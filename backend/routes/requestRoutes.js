const express = require('express');

const router = express.Router();
const { submitRequest } = require('../controllers/requestController');
const { fetchRequest } = require('../controllers/requestController');
const { fetchAllRequest } = require('../controllers/requestController');
const { updateRequestStatus} = require('../controllers/requestController');
const {getFile} = require('../controllers/requestController');
const { verifyAccessToken} = require('../middlewares/auth');
const { updateInfo} = require('../controllers/requestController');
const { memoryUpload } = require('../config/gridfs');


router.post('/submit', verifyAccessToken, submitRequest);
router.get('/', verifyAccessToken, fetchRequest);
router.get('/all', verifyAccessToken, fetchAllRequest);
router.patch('/:id', verifyAccessToken, memoryUpload.single('pdf'), updateRequestStatus);
router.patch('/edit/:requestId',verifyAccessToken,updateInfo);

router.get('/file/:fileId',getFile);


module.exports = router;