import express from "express";
import * as authController from "../controllers/authController.js";
import authMiddleware from "../middleware/auth.js";
import validateBody from "../utils/validateBody.js";
import { signupSchema, loginSchema } from "../validators/authValidator.js";

const router = express.Router();

router.post("/signup", validateBody(signupSchema), authController.signup);
router.post("/login", validateBody(loginSchema), authController.login);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authMiddleware, authController.logout);
router.get("/me", authMiddleware, authController.getMe);

export default router;
