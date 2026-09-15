const { User, ValidEmail, ValidPassword } = require("../models/Users");
const asyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// @desc    Reset user password
// @route   POST /api/reset-password
// @access  Public

const sendResetPasswordEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const validationError = ValidEmail(req.body);
  if (validationError) {
    return res
      .status(400)
      .json({ message: validationError.details[0].message });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const secret = process.env.JWT_SECRET + user.password;
  const token = jwt.sign({ email: user.email, id: user._id }, secret, {
    expiresIn: "15m",
  });

  const link = `http://localhost:5173/reset-password/${user._id}/${token}`;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS.replace(/\s+/g, ""),
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Reset Password",
    html: `<p>Click the link below to reset your password:</p><a href="${link}">Reset Password</a>`,
  };
  try {
    await transporter.sendMail(mailOptions);
    return res
      .status(200)
      .json({ message: "Reset password email sent successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error sending email", error: error.message });
  }
});

const getResetPasswordPage = asyncHandler(async (req, res) => {
  const { id, token } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const secret = process.env.JWT_SECRET + user.password;
  try {
    jwt.verify(token, secret);
    res.status(200).json({ message: "Valid token" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  const validationError = ValidPassword(req.body);
  if (validationError) {
    return res
      .status(400)
      .json({ message: validationError.details[0].message });
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const secret = process.env.JWT_SECRET + user.password;
  try {
    jwt.verify(token, secret);
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

module.exports = {
  sendResetPasswordEmail,
  getResetPasswordPage,
  resetPassword,
};
