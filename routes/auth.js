const express = require('express');
const router = express.Router();

const { register, login, logout, sendEmailVerification, verifyVerificationCode, getMe, resetPassword } = require('../controllers/authController');

// ME
router.get('/me', getMe);

// GET all users
router.post('/login', login);
router.post('/logout', logout);

// POST a new user
router.post('/register', register);
router.post('/sendVerificationEmail', sendEmailVerification);
router.post('/verifyVerificationCode', verifyVerificationCode);
router.post('/resetPassword', resetPassword);


module.exports = router;
