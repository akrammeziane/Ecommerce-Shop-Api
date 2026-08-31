const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");

router.route("/login").post(loginUser);
router.route("/register").post(registerUser);

module.exports = router;
