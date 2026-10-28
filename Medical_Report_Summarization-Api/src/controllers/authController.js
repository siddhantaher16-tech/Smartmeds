import supabase from "../config/supabase.js";
import authService from "../services/authService.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

// Validation is now handled by Zod middleware, so we can assume req.body is clean
export const signup = asyncHandler(async (req, res) => {
  const { full_name, email, password, role } = req.body;

  const { user, session, profile } = await authService.signup(
    full_name,
    email,
    password,
    role,
  );

  return sendSuccess(
    res,
    {
      user,
      profile,
      access_token: session?.access_token,
      refresh_token: session?.refresh_token,
      expires_at: session?.expires_at,
    },
    "User created successfully",
    201
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, session, profile } = await authService.login(email, password);

  return sendSuccess(
    res,
    {
      user,
      profile,
      access_token: session?.access_token,
      refresh_token: session?.refresh_token,
      expires_at: session?.expires_at,
    },
    "Logged in successfully",
    200
  );
});

export const getMe = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await authService.getProfile(userId);

  return sendSuccess(
    res,
    {
      user: {
        id: req.user.id,
        email: req.user.email,
      },
      profile,
    },
    "Profile fetched successfully",
    200
  );
});

export const refreshToken = asyncHandler(async (req, res, next) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: "Refresh token is required" });
  }

  const { data, error } = await supabase.auth.refreshSession({ refresh_token });

  if (error) {
    return res.status(401).json({ error: "Invalid or expired refresh token. Please login again." });
  }

  return res.status(200).json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
  });
});

export const logout = asyncHandler(async (req, res) => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(200).json({ message: "Logged out successfully" });
});
