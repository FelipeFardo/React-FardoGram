const express = require("express");
const router = express.Router();

// Controllers
const { register } = require("../controllers/UserController");

// Middlewares
const validate = require("../middlewares/handleValidation");
const { userCreatedValidation } = require("../middlewares/userValidations");

// Routes
router.post("/register", userCreatedValidation(), validate, register);

module.exports = router;
