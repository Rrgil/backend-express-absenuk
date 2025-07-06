import express from 'express';
import { createBackup, getBackupFiles, backupPresensi } from '../controllers/backup.controller.js';
import auth from '../middleware/verifyToken.js';

const router = express.Router();

// Protected routes
router.post('/create', auth.authMiddleware, createBackup);
router.get('/files', auth.authMiddleware, getBackupFiles);
router.get('/presensi', auth.authMiddleware, backupPresensi);

export default router;
