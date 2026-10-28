/**
 * Wraps async express route handlers to pass errors to next() automatically.
 * Eliminates the need for try/catch blocks in every controller.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

export default asyncHandler;
