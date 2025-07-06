import express from "express";
import {
    getAllPresensi,
    getPresensiByMahasiswa,
    createPresensiMasuk,
    createPresensiPulang
} from "../controllers/presensi.controller.js";
import { uploadPresensiSingle } from "../config/multer.config.js";

const router = express.Router();

// Route untuk mendapatkan semua data presensi
router.get("/", getAllPresensi);

// Route untuk mendapatkan riwayat presensi per mahasiswa
router.get("/mahasiswa/:id_mahasiswa", getPresensiByMahasiswa);

// Route untuk membuat presensi masuk dari mobile
router.post("/masuk", uploadPresensiSingle('image'), createPresensiMasuk);

// Route untuk membuat presensi pulang dari mobile
router.post("/pulang", uploadPresensiSingle('image'), createPresensiPulang);

export default router;