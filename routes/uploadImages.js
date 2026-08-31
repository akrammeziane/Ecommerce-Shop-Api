const express = require("express");
const router = express.Router();
const {
  upload,
  uploadImage,
} = require("../controllers/uploadImagesController");
const { verifyAdmin } = require("../middlewares/auth/VerifyAuth");

router.post("/", verifyAdmin, upload, uploadImage);

module.exports = router;
