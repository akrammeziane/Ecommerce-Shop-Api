const jwt = require("jsonwebtoken");

const verifyAuth = (req, res, next) => {
  const token = req.headers.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: "invalid Token" });
    }
  } else {
    return res.status(401).json({ message: "Token not found" });
  }
};
const verifyAdmin = (req, res, next) => {
  verifyAuth(req, res, () => {
    if (req.user?.isAdmin === true) {
      next();
    } else {
      return res
        .status(403)
        .json({ message: "You are not allowed to do that" });
    }
  });
};

module.exports = { verifyAuth, verifyAdmin };
