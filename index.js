const express = require("express");
const app = express();
const connectDB = require("./config/db");
const helmet = require("helmet");
const cors = require("cors");

const { NotFound, VerifyErrors } = require("./middlewares/VerifyErrors");
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

//CALIING MIDDLEWARES
const logger = require("./middlewares/logger");
app.use(logger);

// Connect to database
connectDB();

// Routes
app.use("/api/products", require("./routes/Product"));
app.use("/api/users", require("./routes/Users"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/orders", require("./routes/Orders"));
app.use("/api/upload", require("./routes/uploadImages"));

// CALLING MIDDLEWARES
app.use(NotFound);
app.use(VerifyErrors);

app.listen(process.env.PORT, () => {
  console.log("Server is running on port " + process.env.PORT);
});
