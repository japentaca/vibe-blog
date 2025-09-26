const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Default error response
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.message = 'Validation Error';
    error.status = 400;
    error.details = err.errors;
  }

  if (err.name === 'CastError') {
    error.message = 'Resource not found';
    error.status = 404;
  }

  // Database errors
  if (err.code === 'SQLITE_CONSTRAINT') {
    error.message = 'Database constraint violation';
    error.status = 400;
  }

  res.status(error.status).json({
    success: false,
    error: {
      message: error.message,
      ...(error.details && { details: error.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

export default errorHandler;