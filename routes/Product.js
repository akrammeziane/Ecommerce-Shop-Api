const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getLatestProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/ProductController");
const { verifyAdmin } = require("../middlewares/auth/VerifyAuth");
const upload = require("../middlewares/imageUploader");

// GET all products
router
  .route("/")
  .get(getAllProducts)
  .post(verifyAdmin, upload.single("image"), createProduct);

// GET latest products
router.route("/latest").get(getLatestProducts);

// GET, UPDATE, DELETE a product by ID
router
  .route("/:id")
  .get(getProductById)
  .put(verifyAdmin, upload.single("image"), updateProduct)
  .delete(verifyAdmin, deleteProduct);

module.exports = router;
