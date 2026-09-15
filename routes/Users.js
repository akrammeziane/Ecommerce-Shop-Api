const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  deleteUser,
  editUser,
  changePassword,
} = require("../controllers/UsersController");
const { verifyAuth, verifyAdmin } = require("../middlewares/auth/VerifyAuth");

router.route("/").get(verifyAdmin, getAllUsers);
router
  .route("/:id")
  .get(verifyAdmin, getUserById)
  .delete(verifyAuth, deleteUser)
  .put(verifyAdmin, editUser)
  .put(verifyAuth, changePassword);

module.exports = router;
