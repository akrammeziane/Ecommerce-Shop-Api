const mongoose = require("mongoose");
const joi = require("joi");

const OrdersSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    guestInfo: {
      type: {
        name: {
          type: String,
          minlength: 2,
          maxlength: 100,
          trim: true,
          required: true,
        },
        email: { type: String, lowercase: true, trim: true },
        phone: {
          type: String,
          minlength: 10,
          maxlength: 15,
          trim: true,
          required: true,
        },
        address: {
          type: String,
          trim: true,
          minlength: 5,
          maxlength: 200,
          required: true,
        },
      },
      required: false,
    },
    products: {
      type: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: { type: Number, required: true, min: 1 },
          chosenSize: { type: String, required: true },
          chosenColor: { type: String, required: true },
        },
      ],
      required: true,
    },
    totalPrice: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);
const Order = mongoose.model("Order", OrdersSchema);

const updatingOrder = (order) => {
  const orderValidationSchema = joi.object({
    userId: joi.string(),
    guestInfo: joi.object({
      name: joi.string().min(2).max(100).trim(),
      email: joi.string().email().lowercase(),
      phone: joi.string().min(10).max(15).trim(),
      address: joi.string().min(5).max(200).trim(),
    }),
    products: joi.array().items(
      joi.object({
        productId: joi.string(),
        quantity: joi.number().min(1),
        chosenSize: joi.string(),
        chosenColor: joi.string(),
      }),
    ),
    totalPrice: joi.number().min(0),
    status: joi.string().valid("pending", "shipped", "delivered", "cancelled"),
  });
  const { error } = orderValidationSchema.validate(order);
  return error;
};

const ValidatingOrder = (order) => {
  const orderValidationSchema = joi
    .object({
      userId: joi.string(),
      guestInfo: joi.object({
        name: joi.string().required().min(2).max(100).trim(),
        email: joi.string().email().lowercase(),
        phone: joi.string().required().min(10).max(15).trim(),
        address: joi.string().required().min(5).max(200).trim(),
      }),
      products: joi.array().items(
        joi.object({
          productId: joi.string().required(),
          quantity: joi.number().min(1).required(),
          chosenSize: joi.string().required(),
          chosenColor: joi.string().required(),
        }),
      ),
      totalPrice: joi.number().min(0),
      status: joi
        .string()
        .valid("pending", "shipped", "delivered", "cancelled"),
    })
    .xor("userId", "guestInfo");
  const { error } = orderValidationSchema.validate(order);
  return error;
};

module.exports = { Order, ValidatingOrder, updatingOrder };
