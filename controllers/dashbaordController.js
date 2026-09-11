const { Order } = require("../models/Orders");
const { Product } = require("../models/Product");
const { User } = require("../models/Users");
const asyncHandler = require("express-async-handler");

const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [
    totalRevenueResult,
    monthlyRevenueResult,
    averageOrderResult,
    totalOrdersCountResult,
    pendingOrdersCountResult,
    cancelledOrdersCountResult,
    deliveredOrdersCountResult,
    recentOrders,
    totalProductsCountResult,
    lowStockProductsCount,
    outOfStockProductsCount,
    topSellingProducts,
    totalUsersCount,
    newAccountRegistrations,
    numbersOfUserswithAtLeastOneOrder,
  ] = await Promise.all([
    Order.aggregate([
      { $match: { status: { $eq: "delivered" } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]),
    Order.aggregate([
      {
        $match: {
          status: { $eq: "delivered" },
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]),
    Order.aggregate([
      { $group: { _id: null, averageOrderValue: { $avg: "$totalPrice" } } },
    ]),
    Order.countDocuments(),
    Order.countDocuments({ status: "pending" }),
    Order.countDocuments({ status: "cancelled" }),
    Order.countDocuments({ status: "delivered" }),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email phone address")
      .populate("products.productId", "name price image"),
    Product.countDocuments(),
    Product.countDocuments({ quantity: { $lt: 5, $gt: 0 } }),
    Product.countDocuments({ quantity: { $eq: 0 } }),
    Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          totalSold: { $sum: "$products.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          name: "$productDetails.name",
          totalSold: 1,
        },
      },
    ]),
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: startOfMonth } }),
    User.aggregate([
      { $match: { productsOrdered: { $exists: true, $not: { $size: 0 } } } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]),
  ]);

  const totalRevenue =
    totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;
  const monthlyRevenue =
    monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].total : 0;
  const averageOrderValue =
    averageOrderResult.length > 0 ? averageOrderResult[0].averageOrderValue : 0;
  const totalOrdersCount = totalOrdersCountResult;
  const pendingOrdersCount = pendingOrdersCountResult;
  const cancelledOrdersCount = cancelledOrdersCountResult;
  const deliveredOrdersCount = deliveredOrdersCountResult;
  const recentOrdersList = recentOrders;
  const totalProductsCount = totalProductsCountResult;
  const lowStockProductsCountValue = lowStockProductsCount;
  const outOfStockProductsCountValue = outOfStockProductsCount;
  const topSellingProductsList = topSellingProducts;
  const totalUsersCountValue = totalUsersCount;
  const newAccountRegistrationsValue = newAccountRegistrations;
  const numbersOfUserswithAtLeastOneOrderValue =
    numbersOfUserswithAtLeastOneOrder.length > 0
      ? numbersOfUserswithAtLeastOneOrder[0].count
      : 0;

  res.status(200).json({
    totalRevenue,
    monthlyRevenue,
    averageOrderValue,
    totalOrdersCount,
    pendingOrdersCount,
    cancelledOrdersCount,
    deliveredOrdersCount,
    recentOrdersList,
    totalProductsCount,
    lowStockProductsCountValue,
    outOfStockProductsCountValue,
    topSellingProductsList,
    totalUsersCountValue,
    newAccountRegistrationsValue,
    numbersOfUserswithAtLeastOneOrderValue,
  });
});

module.exports = {
  getDashboardStats,
};
