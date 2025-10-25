const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  
  max: 5,
  message: 'Too many login attempts',
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  
  max: 3,
  message: 'Too many registrations',
});

router.post('/login', loginLimiter, authController.login);
router.post('/register', registerLimiter, authController.register);

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);

module.exports = router;
