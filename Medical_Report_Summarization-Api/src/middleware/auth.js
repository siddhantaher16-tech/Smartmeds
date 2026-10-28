import supabase from "../config/supabase.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "No token provided",
        code: "NO_TOKEN",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify the JWT using supabase.auth.getUser(token)
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error("Auth error:", error?.message);
      if (error?.message && error.message.toLowerCase().includes("expired")) {
        return res.status(401).json({
          error: "Token expired",
          code: "TOKEN_EXPIRED",
        });
      }
      return res.status(401).json({
        error: "Invalid token",
        code: "INVALID_TOKEN",
      });
    }

    // Attach user object to req.user
    req.user = user;
    next();
  } catch (error) {
    console.error("Middleware error:", error);
    return res.status(401).json({
      error: "Invalid token",
      code: "INVALID_TOKEN",
    });
  }
};

export default authMiddleware;
