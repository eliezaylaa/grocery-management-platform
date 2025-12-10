exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      error: "Validation error",
      details: err.errors.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      error: "Duplicate entry",
      field: err.errors[0].path,
    });
  }

  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
};

exports.notFound = (req, res) => {
  res.status(404).json({ error: "Route not found" });
};
