const express = require("express");
const router = express.Router();
const {
  sendResetPasswordEmail,
  getResetPasswordPage,
  resetPassword,
} = require("../controllers/ResetPasswordController");

router.post("/reset-password", sendResetPasswordEmail);
router
  .route("/reset-password/:id/:token")
  .get(getResetPasswordPage)
  .post(resetPassword);

module.exports = router;
