const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middlewares/auth/VerifyAuth");
const { getDashboardStats } = require("../controllers/dashbaordController");

router.get("/dashboard", verifyAdmin, getDashboardStats);

module.exports = router;
