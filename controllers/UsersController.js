const asyncHandler = require("express-async-handler");
const { User, UpdatingUser } = require("../models/Users");

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private
 */
const getAllUsers = asyncHandler(async (req, res) => {
  if (Object.keys(req.query).length === 0) {
    const users = await User.find().select("-password");
    const totalUsers = await User.countDocuments();
    return res.status(200).json({ users, totalUsers });
  }
  const { name, email, phone, address, isAdmin, page, limit } = req.query;
  const filter = {};
  if (name) {
    filter.name = { $regex: name, $options: "i" };
  }
  if (email) {
    filter.email = { $regex: email, $options: "i" };
  }
  if (phone) {
    filter.phone = { $regex: phone, $options: "i" };
  }
  if (address) {
    filter.address = { $regex: address, $options: "i" };
  }
  if (isAdmin === "true" || isAdmin === "false") {
    filter.isAdmin = isAdmin === "true";
  }
  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNumber - 1) * pageSize;

  const [users, totalUsers, totalAdmins, totalRegularUsers] = await Promise.all(
    [
      User.find(filter).skip(skip).select("-password").limit(pageSize),
      User.countDocuments(filter),
      User.countDocuments({ ...filter, isAdmin: true }),
      User.countDocuments({ ...filter, isAdmin: false }),
    ],
  );

  res.status(200).json({
    users,
    totalUsers,
    totalAdmins,
    totalRegularUsers,
    totalPages: Math.ceil(totalUsers / pageSize),
    currentPage: pageNumber,
  });
});

/**
 * @desc    Get user by id
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate("productsOrdered")
    .select("-password")
    .populate("productsBought");
  if (!user) {
    console.log("User not found");
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json(user);
});

/**
 * @desc    delete user
 * @route   DELETE /api/users/:id
 * @access  Private
 */
const deleteUser = asyncHandler(async (req, res) => {
  if (req.user?.id === req.params.id || req.user?.isAdmin === true) {
    const user = await User.findById(req.params.id);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }
    await User.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      _id: req.params.id,
      isAdmin: user.isAdmin,
      message: "User removed",
    });
  } else {
    return res.status(403).json({ message: "You Are not Allowed to do that" });
  }
});
/**
 * @desc    Edit user
 * @route   PUT /api/users/:id
 * @access  Private
 */
const editUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const error = UpdatingUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { name, email, phone, address } = req.body;
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { $set: { name, email, phone, address } },
    { new: true },
  );
  if (!updatedUser) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json(updatedUser);
});
module.exports = {
  getAllUsers,
  getUserById,
  deleteUser,
  editUser,
};
