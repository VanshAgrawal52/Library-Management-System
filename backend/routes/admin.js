const express = require('express');
const router = express.Router();
const { verifyAccessToken } = require('../middlewares/auth');
const { getAllUsers, updateUserRole, checkAdmin } = require('../controllers/adminController');

//All routes for admin
router.get('/users',verifyAccessToken,getAllUsers);
router.put('/users/:id/role',verifyAccessToken,updateUserRole);
router.get('/check-admin',verifyAccessToken,checkAdmin);


module.exports = router;