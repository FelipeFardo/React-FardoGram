const express = require("express");
const router = express.Router();

// Controllers
const { register } = require("../controllers/UserController");

// Routes
router.post("/register", register);

module.exports = router;
