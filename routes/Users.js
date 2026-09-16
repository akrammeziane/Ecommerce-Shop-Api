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
  .get(verifyAuth, getUserById)
  .delete(verifyAuth, deleteUser)
  .put(verifyAuth, editUser);
router.put("/:id/change-password", verifyAuth, changePassword);

module.exports = router;
