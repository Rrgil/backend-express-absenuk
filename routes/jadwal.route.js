import express from "express";
import {
    getAllJadwal,
    getJadwalById,
    createJadwal,
    updateJadwal,
    deleteJadwal,
    getJadwalForMobile,
    getJadwalHariIniForMahasiswa
} from "../controllers/jadwal.controller.js";
import auth from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", getAllJadwal);

// Untuk mobile 
router.get("/mobile", auth.authMiddleware, getJadwalForMobile);

// Untuk mobile - jadwal hari ini
router.get("/mobile/hari-ini/:id_mahasiswa", auth.authMiddleware, getJadwalHariIniForMahasiswa);

router.get("/:id", auth.authMiddleware, getJadwalById);
router.post("/", auth.authMiddleware, createJadwal);
router.put("/:id", auth.authMiddleware, updateJadwal);
router.delete("/:id", auth.authMiddleware, deleteJadwal);

export default router;