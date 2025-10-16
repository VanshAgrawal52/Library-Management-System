const express = require('express');
const router = express.Router();
const { verifyAccessToken } = require('../middlewares/auth');
const { getAllUsers, updateUserRole } = require('../controllers/adminController');

//All routes for admin
router.get('/users',verifyAccessToken,getAllUsers);
router.put('/users/:id/role',verifyAccessToken,updateUserRole);


module.exports = router;