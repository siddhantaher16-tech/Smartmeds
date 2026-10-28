/**
 * Standardized API responses
 */
export const sendSuccess = (
  res,
  data = null,
  message = "Success",
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
  });
};

export const sendError = (res, error, statusCode = 500, errors = null) => {
  const message = error.message || error || "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV !== "production" && error.stack
      ? { stack: error.stack }
      : {}),
    ...(errors && { errors }),
  });
};
