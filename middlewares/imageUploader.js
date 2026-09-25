const cloudinary = require("../config/cloudiary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "png", "webp"],
  },
});

const upload = multer({ storage });

module.exports = upload;
