const NotFound = (req, res, next) => {
  const error = new Error(`${req.originalUrl} Not found`);
  res.status(404);
  next(error);
};
const VerifyErrors = (err, req, res, next) => {
  const statuscode = res.statusCode === 200 ? 500 : res.statusCode;
  res
    .status(statuscode)
    .json({ message: err.message || "Internal Server Error" });
};
module.exports = { NotFound, VerifyErrors };
