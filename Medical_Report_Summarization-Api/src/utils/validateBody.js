import { z } from "zod";
import { sendError } from "./apiResponse.js";

/**
 * Middleware function that takes a Zod schema and validates the request body.
 * If validation fails, it intercepts the request and sends a formatted 400 Bad Request.
 * If validation passes, it proceeds to the controller.
 *
 * @param {z.ZodObject} schema - The Zod schema to validate req.body against
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      // Parse the incoming body against the schema
      const validatedData = schema.parse(req.body);

      // Optionally replace the req.body with the sanitized/validated data
      req.body = validatedData;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format the Zod validation errors to be easily readable by the client
        const validationErrors = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return sendError(res, "Validation failed", 400, validationErrors);
      }

      // Pass any non-Zod errors to the global error handler
      next(error);
    }
  };
};

export default validateBody;
