const { Order, ValidatingOrder, updatingOrder } = require("../models/Orders");
const asyncHandler = require("express-async-handler");
const { User } = require("../models/Users");
const { Product } = require("../models/Product");

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private
 */
const getAllOrders = asyncHandler(async (req, res) => {
  if (Object.keys(req.query).length === 0) {
    const orders = await Order.find()
      .populate("userId", "name email phone address")
      .populate("products.productId", "name price image");
    const totalOrders = await Order.countDocuments();
    return res.status(200).json({ orders, totalOrders });
  }
  const { phone, productId, status, page, limit } = req.query;
  const filter = {};
  if (phone) {
    const phoneRegex = { $regex: phone, $options: "i" };
    const matchingUsers = await User.find({
      phone: phoneRegex,
    }).distinct("_id");
    filter.$or = [
      { userId: { $in: matchingUsers } },
      { "guestInfo.phone": phoneRegex },
    ];
  }
  if (productId) {
    filter["products.productId"] = productId;
  }
  if (status) {
    filter.status = status;
  }

  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNumber - 1) * pageSize;

  const [orders, totalOrders, totalPendingOrders, totalRevenueResult] =
    await Promise.all([
      Order.find(filter)
        .skip(skip)
        .limit(pageSize)
        .populate("userId", "name email phone address")
        .populate("products.productId", "name price image"),
      Order.countDocuments(filter),
      Order.countDocuments({ status: "pending" }),
      Order.aggregate([
        { $match: { status: { $eq: "delivered" } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
    ]);
  const totalPages = Math.ceil(totalOrders / pageSize);
  const totalRevenue =
    totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

  res.status(200).json({
    orders,
    totalOrders,
    totalPendingOrders,
    totalRevenue,
    totalPages,
    currentPage: pageNumber,
  });
});

/**
 * @desc    Get order by id
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  res.status(200).json(order);
});
/**
 * @desc    Update an order by id
 * @route   PUT /api/orders/:id
 * @access  Private
 */
const updateOrder = asyncHandler(async (req, res) => {
  const { status } = req.body;

  // Validate the order data
  const validationError = updatingOrder(req.body);
  if (validationError) {
    return res
      .status(400)
      .json({ message: validationError.details[0].message });
  }
  const exsistingOrder = await Order.findById(req.params.id);
  if (!exsistingOrder) {
    return res.status(404).json({ message: "Order not found" });
  }
  const previousStatus = exsistingOrder.status;

  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    {
      $set: { status },
    },
    { new: true, runValidators: true },
  )
    .populate("userId", "name email phone address")
    .populate("products.productId", "name price image");

  if (!updatedOrder) {
    return res.status(404).json({ message: "Order not found" });
  }
  if (previousStatus !== "cancelled" && status === "cancelled") {
    for (const product of updatedOrder.products) {
      await Product.findByIdAndUpdate(
        product.productId,
        { $inc: { quantity: product.quantity } },
        { new: true },
      );
    }
  }
  if (
    req.body.userId &&
    status === "delivered" &&
    previousStatus !== "delivered"
  ) {
    for (let i = 0; i < updatedOrder.products.length; i++) {
      await User.findByIdAndUpdate(
        req.body.userId,
        { $push: { productsBought: updatedOrder.products[i].productId } },
        { new: true },
      );
    }
  }

  res.status(200).json(updatedOrder);
});

/**
 * @desc    Delete an order by id
 * @route   DELETE /api/orders/:id
 * @access  Private
 */
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  const deletedOrder = await Order.findByIdAndDelete(req.params.id);

  if (!deletedOrder) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (deletedOrder.products && deletedOrder.products.length > 0) {
    const updatedPromises = deletedOrder.products.map((product) =>
      Product.findByIdAndUpdate(
        product.productId,
        { $inc: { quantity: product.quantity } },
        { new: true },
      ),
    );
    await Promise.all(updatedPromises);
  }

  res.status(200).json({
    _id: req.params.id,
    totalPrice: deletedOrder.totalPrice,
    status: deletedOrder.status,
    message: "Order deleted successfully",
  });
});

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = asyncHandler(async (req, res) => {
  const { userId: bodyUserId, guestInfo, products, status } = req.body;
  const userId = req.user ? req.user.id : bodyUserId;
  if (userId) {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  }
  if (
    !userId &&
    (!guestInfo || !guestInfo.name || !guestInfo.phone || !guestInfo.address)
  ) {
    return res.status(400).json({ message: "Guest information is required" });
  }
  // Validate the order data
  const validationError = ValidatingOrder(req.body);
  if (validationError) {
    return res
      .status(400)
      .json({ message: validationError.details[0].message });
  }
  if (products.length === 0) {
    return res.status(400).json({ message: "Products array cannot be empty" });
  }
  let totalprice = 0;
  for (const product of products) {
    if (
      !product.productId ||
      !product.quantity ||
      !product.chosenSize ||
      !product.chosenColor
    ) {
      return res
        .status(400)
        .json({ message: "Product information is incomplete" });
    }
    const productExists = await Product.findById(product.productId);
    if (!productExists) {
      return res
        .status(404)
        .json({ message: `Product with id ${product.productId} not found` });
    }
    if (product.quantity > productExists.quantity) {
      return res.status(400).json({
        message: `Not enough stock for product with id ${product.productId}`,
      });
    }
    if (
      product.chosenSize &&
      !productExists.availableSizes.includes(product.chosenSize)
    ) {
      return res.status(400).json({
        message: `Chosen size ${product.chosenSize} is not available for product with id ${product.productId}`,
      });
    }
    if (
      product.chosenColor &&
      !productExists.availableColors.includes(product.chosenColor)
    ) {
      return res.status(400).json({
        message: `Chosen color ${product.chosenColor} is not available for product with id ${product.productId}`,
      });
    }
    totalprice += productExists.price * product.quantity;
  }

  // Create a new order
  const order = new Order({
    userId: userId || null,
    guestInfo,
    products,
    totalPrice: Number(totalprice.toFixed(2)),
    status,
  });

  await order.save();
  const createdOrder = await order.populate([
    { path: "userId", select: "name email phone address" },
    { path: "products.productId", select: "name price image" },
  ]);
  for (const product of products) {
    await Product.findByIdAndUpdate(
      product.productId,
      { $inc: { quantity: -product.quantity } },
      { new: true },
    );
  }
  if (userId) {
    for (let i = 0; i < products.length; i++) {
      await User.findByIdAndUpdate(
        userId,
        { $push: { productsOrdered: createdOrder.products[i].productId } },
        { new: true },
      );
    }
  }
  res.status(201).json(createdOrder);
});

module.exports = {
  getAllOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderById,
};
