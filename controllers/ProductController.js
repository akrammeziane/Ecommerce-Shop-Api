const { Product } = require("../models/Product");
const { Order } = require("../models/Orders");
const { AddingProduct, UpdatingProduct } = require("../models/Product");
const asyncHandler = require("express-async-handler");

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
const getAllProducts = asyncHandler(async (req, res) => {
  if (Object.keys(req.query).length === 0) {
    const products = await Product.find();
    return res.status(200).json(products);
  }
  const {
    status,
    name,
    id,
    price,
    minPrice,
    maxPrice,
    category,
    availableSizes: size,
    availableColors: color,
    page,
    limit,
    quantity,
  } = req.query;
  const filter = {};
  if (name) {
    filter.name = { $regex: name, $options: "i" };
  }
  if (status) {
    filter.status = status;
  }
  if (id) {
    filter._id = id;
  }
  if (price) {
    filter.price = Number(price);
  } else if (minPrice || maxPrice) {
    filter.price = {};

    if (minPrice) {
      filter.price.$gte = Number(minPrice);
    }

    if (maxPrice) {
      filter.price.$lte = Number(maxPrice);
    }
  }
  if (category) {
    filter.category = category;
  }
  if (size) {
    filter.availableSizes = size;
  }
  if (color) {
    filter.availableColors = { $regex: color, $options: "i" };
  }
  if (quantity) {
    filter.quantity = Number(quantity);
  }
  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNumber - 1) * pageSize;

  const [products, totalProducts, totalInStock, totalOutOfStock] =
    await Promise.all([
      Product.find(filter).skip(skip).limit(pageSize),
      Product.countDocuments(filter),
      Product.countDocuments({ ...filter, quantity: { $gt: 0 } }),
      Product.countDocuments({ ...filter, quantity: { $eq: 0 } }),
    ]);
  const totalPages = Math.ceil(totalProducts / pageSize);

  res.status(200).json({
    products,
    totalProducts,
    totalInStock,
    totalOutOfStock,
    totalPages,
    currentPage: pageNumber,
    pageSize: pageSize,
  });
});
/**
 * @desc    Get latestproducts
 * @route   GET /api/products
 * @access  Public
 */

const getLatestProducts = asyncHandler(async (req, res) => {
  const latestProducts = await Product.find().sort({ createdAt: -1 }).limit(6);
  res.status(200).json(latestProducts);
});

/**
 * @desc    Get product by id
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.status(200).json(product);
});

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private
 */
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, quantity } = req.body;
  let { availableSizes, availableColors } = req.body;

  try {
    availableSizes = JSON.parse(availableSizes);
    availableColors = JSON.parse(availableColors);
  } catch {
    return res
      .status(400)
      .json({ message: "Invalid JSON format for sizes or colors" });
  }

  const productData = {
    name,
    description,
    price,
    category,
    quantity,
    availableSizes,
    availableColors,
    image: req.file ? req.file.path : undefined,
  };

  const validationError = AddingProduct(productData);
  if (validationError) {
    return res
      .status(400)
      .json({ message: validationError.details[0].message });
  }

  const product = new Product({
    name,
    description,
    price,
    image,
    availableSizes,
    availableColors,
    category,
    quantity,
    status: quantity > 0 ? "In Stock" : "Out Of Stock",
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});
/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private
 */
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    image,
    availableSizes: size,
    availableColors: color,
    category,
    quantity,
  } = req.body;

  // Validate the product data
  const validationError = UpdatingProduct(req.body);
  if (validationError) {
    return res
      .status(400)
      .json({ message: validationError.details[0].message });
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        name,
        description,
        price,
        image,
        availableSizes: size,
        availableColors: color,
        category,
        quantity,
        status: quantity > 0 ? "In Stock" : "Out Of Stock",
      },
    },
    { new: true },
  );
  // Update the total in stock and out of stock counts
  const [totalInStock, totalOutOfStock] = await Promise.all([
    Product.countDocuments({ quantity: { $gt: 0 } }),
    Product.countDocuments({ quantity: { $eq: 0 } }),
  ]);

  res
    .status(200)
    .json({ product: updatedProduct, totalInStock, totalOutOfStock });
});

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  await Product.findByIdAndDelete(req.params.id);
  const orders = await Order.find({ "products.productId": req.params.id });
  for (const order of orders) {
    const item = order.products.find(
      (p) => p.productId.toString() === req.params.id,
    );
    if (item) {
      const amountToDeduct = item.quantity * product.price;
      order.products = order.products.filter(
        (p) => p.productId.toString() !== req.params.id,
      );
      order.totalPrice = Math.max(0, order.totalPrice - amountToDeduct);
      await order.save();
    }
  }
  res.status(200).json({
    _id: req.params.id,
    name: product.name,
    status: product.status,
    message: `Product ${product.name} with id ${req.params.id} has been deleted successfully`,
  });
});
module.exports = {
  getAllProducts,
  getLatestProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
