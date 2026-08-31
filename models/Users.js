const mongoose = require("mongoose");
const joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const UsersSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: 2,
      maxlength: 100,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      minlength: 10,
      maxlength: 15,
      trim: true,
    },
    address: {
      type: String,
      minlength: 5,
      maxlength: 200,
      trim: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
    },
    productsOrdered: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    productsBought: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true },
);

const User = mongoose.model("User", UsersSchema);

// const AddingUser = (user) => {
//   const userValidationSchema = joi.object({
//     name: joi.string().min(2).max(100).trim().required(),
//     email: joi.string().email().trim().lowercase().required(),
//     phone: joi.string().min(10).max(15).trim().required(),
//     address: joi.string().min(5).max(200).trim().required(),
//   });
//   const { error } = userValidationSchema.validate(user);
//   return error;
// };

const UpdatingUser = (user) => {
  const userValidationSchema = joi.object({
    name: joi.string().min(2).max(100).trim(),
    email: joi.string().email().trim().lowercase(),
    phone: joi.string().min(10).max(15).trim(),
    address: joi.string().min(5).max(200).trim(),
  });
  const { error } = userValidationSchema.validate(user);
  return error;
};
// AUTH
const ValidLogin = (user) => {
  const loginValidationSchema = joi.object({
    email: joi.string().email().trim().lowercase().required(),
    password: passwordComplexity().required(),
  });
  const { error } = loginValidationSchema.validate(user);
  return error;
};
const ValidRegister = (user) => {
  const registerValidationSchema = joi.object({
    name: joi.string().min(2).max(100).trim().required(),
    phone: joi.string().min(10).max(15).trim(),
    address: joi.string().min(5).max(200).trim(),
    email: joi.string().email().trim().lowercase().required(),
    password: passwordComplexity().required(),
  });
  const { error } = registerValidationSchema.validate(user);
  return error;
};

module.exports = { User, UpdatingUser, ValidLogin, ValidRegister };
