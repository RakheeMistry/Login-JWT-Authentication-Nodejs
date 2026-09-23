import express from 'express';
import { getUserDetails, loginUser, logout, registerUser, refreshToken } from '../controllers/UserController.js';
const router = express.Router();

router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/userDetails",getUserDetails);
router.get("/refresh-token", refreshToken);
router.post("/logout",logout);

export default router ;