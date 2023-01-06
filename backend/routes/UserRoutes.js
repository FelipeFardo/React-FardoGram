const express = require("express");
const router = express.Router();

// Controllers
const {
  register,
  login,
  getCurrentUser,
} = require("../controllers/UserController");

// Middlewares
const validate = require("../middlewares/handleValidation");
const {
  userCreatedValidation,
  loginValidation,
} = require("../middlewares/userValidations");
const authGuard = require("../middlewares/authGuard");

// Routes
router.post("/register", userCreatedValidation(), validate, register);
router.post("/login", loginValidation(), validate, login);
router.get("/profile", authGuard, getCurrentUser);

module.exports = router;
