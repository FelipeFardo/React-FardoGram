const Photo = require("../models/Photo");
const User = require("../models/User");
const mongoose = require("mongoose");
const { off } = require("../routes/Router");

// Insert a photo, with an user related to it
const insertPhoto = async (req, res) => {
  const { title } = req.body;
  const image = req.file.filename;

  const reqUser = req.user;
  const user = await User.findById(req.user._id);

  // Created a photo
  const newPhoto = await Photo.create({
    image,
    title,
    userId: user._id,
    userName: user.name,
  });

  // if photo was created successfully, return data
  if (!newPhoto) {
    return res.status(422).json({
      errors: ["Houve um problema, por favor tente novamente mais tarde"],
    });
  }
  return res.status(201).json(newPhoto);
};

// Remove a photo from DB
const deletePhoto = async (req, res) => {
  const { id } = req.params;
  const reqUser = req.user;
  try {
    const photo = await Photo.findById(mongoose.Types.ObjectId(id));

    // Check if photo exists

    if (!photo) {
      return res.status(404).json({ errors: ["Foto não encontrada."] });
    }
    // Check if photo belongs to user
    if (!photo.userId.equals(reqUser._id)) {
      res.status(422).json({
        errors: ["Ocorreu um erro, por favor tente novamente mais tarde"],
      });
    }
    await Photo.findByIdAndDelete(photo._id);

    res
      .status(200)
      .json({ id: photo._id, message: "Foto excluída com sucesso." });
  } catch (error) {
    return res.status(404).json({ errors: ["Foto não encontrada."] });
  }
};

// Get all photos
const getAllPhotos = async (req, res) => {
  const photos = await Photo.find({})
    .sort([["createdAt", -1]])
    .exec();
  return res.status(200).json(photos);
};

// Get user photos
const getUserPhotos = async (req, res) => {
  const { id } = req.params;
  const photos = await Photo.find({ userId: id })
    .sort([["createdAt", -1]])
    .exec();
  return res.status(200).json(photos);
};

// Get photo by id
const getPhotoById = async (req, res) => {
  const { id } = req.params;
  try {
    const photo = await Photo.findById(mongoose.Types.ObjectId(id));

    // Check if photo exists
    if (!photo)
      return res.status(404).json({ errors: ["Foto não encontrada"] });
    return res.status(200).json(photo);
  } catch (error) {
    return res.status(404).json({ errors: ["Foto não encontrada."] });
  }
};

// Update a photo
const updatePhoto = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  const reqUser = req.user;
  try {
    const photo = await Photo.findById(id);

    // Check if photo exists
    if (!photo) {
      return res.status(404).json({ errors: ["Foto não encontrada"] });
    }
    // Check if photo belongs to user
    if (!photo.userId.equals(reqUser._id)) {
      return res
        .status(422)
        .json({ errors: ["Ocorreu um erro tente novamente mais tarde"] });
    }
    if (title) {
      photo.title = title;
    }
    await photo.save();
    return res
      .status(200)
      .json({ photo, message: "Foto atualizada com sucesso!" });
  } catch (error) {
    return res.status(404).json({ errors: ["Foto não encontrada"] });
  }
};

// Like functionality
const likePhoto = async (req, res) => {
  const { id } = req.params;
  const reqUser = req.user;
  try {
    const photo = await Photo.findById(id);

    if (!photo) {
      return res.status(404).json({ errors: ["Foto não encontrada"] });
    }

    // Check if user already liked the photo
    if (photo.likes.includes(reqUser._id)) {
      return res.status(422).json({ errors: ["Você já curtiu a foto"] });
    }
    // Put user id in likes array
    photo.likes.push(reqUser._id);

    photo.save();

    return res.status(200).json({
      photoId: id,
      userId: reqUser._id,
      message: "A foto foi curtida.",
    });
  } catch (error) {
    return res.status(404).json({ errors: ["Foto não encontrada"] });
  }
};

// Comment functionality
const commentPhoto = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  const reqUser = req.user;
  const user = await User.findById(reqUser._id);
  try {
    const photo = await Photo.findById(id);
    if (!photo) {
      return res.status(404).json({ errors: ["Foto não encontrada"] });
    }

    // Put comment in the array comment
    const userComment = {
      comment,
      userName: user.name,
      userImage: user.profileImage,
      userId: user._id,
    };
    photo.comments.push(userComment);
    await photo.save();
    return res.status(200).json({
      comment: userComment,
      message: "O comentário foi adicionado com sucesso",
    });
  } catch (error) {
    return res.status(404).json({ errors: ["Foto não encontrada"] });
  }
};

module.exports = {
  insertPhoto,
  deletePhoto,
  getAllPhotos,
  getUserPhotos,
  getPhotoById,
  updatePhoto,
  likePhoto,
  commentPhoto,
};
