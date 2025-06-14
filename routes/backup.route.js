import express from 'express';
import { createBackup, getBackupFiles } from '../controllers/backup.controller.js';
import auth from '../middleware/verifyToken.js';

const router = express.Router();

// Protected routes
router.post('/create', auth.authMiddleware, createBackup);
router.get('/files', auth.authMiddleware, getBackupFiles);

export default router;
