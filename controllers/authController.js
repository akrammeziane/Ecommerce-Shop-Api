const { User, ValidRegister } = require("../models/Users");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, phone, address, email } = req.body;

  // Validate the user data
  const validationError = ValidRegister(req.body);
  if (validationError) {
    return res
      .status(400)
      .json({ message: validationError.details[0].message });
  }

  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // Create a new user
  const user = new User({
    name,
    phone,
    address,
    email,
    password: hashedPassword,
  });

  const createdUser = await user.save();
  const { password, ...userWithoutPassword } = createdUser._doc;
  // Generate a JWT token
  const token = jwt.sign(
    { id: createdUser._id, isAdmin: createdUser.isAdmin },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    },
  );
  res.status(201).json({ ...userWithoutPassword, token });
});

/**
 * @desc    Login a user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  );

  res.status(200).json({
    token,
    user: { _id: user._id },
  });
});

module.exports = {
  registerUser,
  loginUser,
};
