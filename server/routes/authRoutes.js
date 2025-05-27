const express = require("express");
const { registerUser } = require("../controllers/authController");

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post("/register", registerUser);

module.exports = router;
