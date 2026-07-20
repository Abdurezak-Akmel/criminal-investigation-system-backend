// Route not found error handler middleware
export function notFound(_req, res) {
  return res.status(404).json({ success: false, message: 'Route not found' });
}

// General error handler middleware
export function errorHandler(err, _req, res, _next) {
  console.error(err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'Duplicate record' });
  }

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
}
