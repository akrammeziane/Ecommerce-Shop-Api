const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  getMyOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} = require("../controllers/OrdersController");
const { verifyAdmin, verifyAuth } = require("../middlewares/auth/VerifyAuth");
const { optionalAuth } = require("../middlewares/auth/optionalAuth");

// GET all orders AND MAKE an order
router
  .route("/")
  .get(verifyAdmin, getAllOrders)
  .post(optionalAuth, createOrder);

// GET, UPDATE, DELETE an order by ID
router
  .route("/:id")
  .get(verifyAdmin, getOrderById)
  .put(verifyAdmin, updateOrder)
  .delete(verifyAdmin, deleteOrder);

// GET my orders
router.route("/my-orders").get(verifyAuth, getMyOrders);

module.exports = router;
