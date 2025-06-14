import express from 'express';
import { getDashboardData } from '../controllers/dashboard.controller.js';
import auth from "../middleware/verifyToken.js";

const router = express.Router();

// Protected routes
router.get('/data', auth.authMiddleware, getDashboardData);

export default router;