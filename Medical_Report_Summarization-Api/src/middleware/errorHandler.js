import { sendError } from "../utils/apiResponse.js";

const errorHandler = (err, req, res, next) => {
  console.error("Global Error:", err);

  const statusCode = err.statusCode || 500;

  // Use centralized response format
  return sendError(res, err, statusCode);
};

export default errorHandler;
