const express = require("express");
const router = express.Router();

// Controllers
const { register, login } = require("../controllers/UserController");

// Middlewares
const validate = require("../middlewares/handleValidation");
const {
  userCreatedValidation,
  loginValidation,
} = require("../middlewares/userValidations");

// Routes
router.post("/register", userCreatedValidation(), validate, register);
router.post("/login", loginValidation(), validate, login);

module.exports = router;
