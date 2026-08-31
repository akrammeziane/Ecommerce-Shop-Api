const jwt = require("jsonwebtoken");

const optionalAuth = (req, res, next) => {
  const token = req.headers.token;
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // If the token is invalid, we can choose to ignore it and proceed without authentication
    }
  }
  next();
};

module.exports = { optionalAuth };
