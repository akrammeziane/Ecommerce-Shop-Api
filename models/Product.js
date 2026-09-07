const mongoose = require("mongoose");
const joi = require("joi");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
      trim: true,
    },
    description: {
      type: String,
      minlength: 2,
      maxlength: 1000,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      default: "https://via.placeholder.com/150",
      trim: true,
    },
    availableSizes: {
      type: [String],
      enum: ["S", "M", "L", "XL", "XXL", "XXXL"],
      required: true,
    },
    availableColors: {
      type: [String],
      required: true,
    },
    category: {
      type: String,
      enum: ["T-Shirts", "Jackets", "Pants", "Hoodies", "Accessories"],
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true },
);
const Product = mongoose.model("Product", ProductSchema);

const AddingProduct = (product) => {
  const productValidationSchema = joi.object({
    name: joi.string().min(2).max(100).trim().required(),
    description: joi.string().min(2).max(1000).trim(),
    price: joi.number().min(0).required(),
    image: joi.string().trim(),
    availableSizes: joi
      .array()
      .items(joi.string().valid("S", "M", "L", "XL", "XXL", "XXXL"))
      .required(),
    availableColors: joi.array().items(joi.string().trim()).required(),
    category: joi.string().trim().required(),
    quantity: joi.number().min(0).default(0),
  });
  const { error } = productValidationSchema.validate(product);
  return error;
};

const UpdatingProduct = (product) => {
  const productValidationSchema = joi.object({
    name: joi.string().min(2).max(100).trim(),
    description: joi.string().min(2).max(1000).trim(),
    price: joi.number().min(0),
    image: joi.string().trim(),
    availableSizes: joi
      .array()
      .items(joi.string().valid("S", "M", "L", "XL", "XXL", "XXXL")),
    availableColors: joi.array().items(joi.string().trim()),
    category: joi.string().trim(),
    quantity: joi.number().min(0).default(0),
  });
  const { error } = productValidationSchema.validate(product);
  return error;
};
module.exports = { Product, AddingProduct, UpdatingProduct };
