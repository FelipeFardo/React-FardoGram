const User = require("../models/User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { default: mongoose } = require("mongoose");

const jwtSecret = process.env.JWT_SECRET;

// Generate user token

const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: "7d",
  });
};

// Register user and sign in
const register = async (req, res) => {
  const { name, email, password } = req.body;

  // check if user exists
  const user = await User.findOne({ email });

  if (user) {
    return res
      .status(422)
      .json({ errors: ["Por favor, utilize outro e-mail"] });
  }

  // Generate password hash
  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user
  const newUser = await User.create({
    name,
    email,
    password: passwordHash,
  });

  // If user was created succesfully, return the token
  if (!newUser) {
    return res
      .status(422)
      .json({ errors: ["Houve um erro por favor tente mais tarde"] });
  }
  return res.status(201).json({
    _id: newUser.id,
    token: generateToken(newUser.id),
  });
};

// Sign user in
const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  // Check if user exists
  if (!user) {
    return res.status(404).json({ errors: ["Usuário não encontrado."] });
  }

  // Check if password matches
  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(422).json({ errors: ["Senha inválida"] });
  }

  // Return user whith
  res.status(200).json({
    _id: user.id,
    profileImage: user.profileImage,
    token: generateToken(user.id),
  });
};

// get current logged in user
const getCurrentUser = async (req, res) => {
  const user = req.user;
  return res.status(200).json(user);
};

// Update an user
const update = async (req, res) => {
  const { name, password, bio } = req.body;

  let profileImage = null;

  if (req.file) {
    profileImage = req.file.filename;
  }

  const reqUser = req.user;
  
  const user = await User.findById(mongoose.Types.ObjectId(reqUser.id)).select(
    "-password"
  );

  if (name) user.name = name;
  if (password) {
    // Generate password hash
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    user.password = passwordHash;
  }

  if (profileImage) user.profileImage = profileImage;

  if (bio) user.bio = bio;

  await user.save();

  return res.status(200).json(user);
};

// Get user by id
const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(mongoose.Types.ObjectId(id)).select(
      "-password"
    );
    // check if user exists
    if (!user) {
      return res.status(404).json({ errors: ["Usuário não encontrado."] });
    }
    res.status(200).json(user);
  } catch (error) {
    return res.status(404).json({ errors: ["Usuário não encontrado."] });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  update,
  getUserById,
};
