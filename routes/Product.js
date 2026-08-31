const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/ProductController");
const { verifyAdmin } = require("../middlewares/auth/VerifyAuth");

// GET all products
router.route("/").get(getAllProducts).post(verifyAdmin, createProduct);

// GET, UPDATE, DELETE a product by ID
router
  .route("/:id")
  .get(getProductById)
  .put(verifyAdmin, updateProduct)
  .delete(verifyAdmin, deleteProduct);

module.exports = router;
