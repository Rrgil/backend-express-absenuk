import express from "express";
import {
    getAllMahasiswa, 
    createMahasiswa, 
    loginMahasiswa, 
    logoutMahasiswa, 
    getMahasiswaById, 
    updateDataMahasiswaById, 
    deleteMahasiswa,
    getMahasiswaByNim,
    updateMahasiswaByNim
} from "../controllers/mahasiswa.controller.js";
import { uploadMahasiswaSingle } from "../config/multer.config.js";
import auth from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", getAllMahasiswa);
router.post("/", auth.authMiddleware, uploadMahasiswaSingle('image'), createMahasiswa);
router.post("/login", loginMahasiswa); // untuk login mobile
router.post("/logout", auth.authMiddleware, logoutMahasiswa); // untuk logout mobile

// Rute untuk mendapatkan profil mahasiswa (membutuhkan otentikasi) (untuk web)
router.get("/id/:id", auth.authMiddleware, getMahasiswaById);

// Rute untuk memperbarui profil mahasiswa (membutuhkan otentikasi) (untuk web)
router.put("/id/:id", auth.authMiddleware, uploadMahasiswaSingle('image'), updateDataMahasiswaById);

// Rute untuk mendapatkan mahasiswa berdasarkan NIM (membutuhkan otentikasi) (untuk mobile)
router.get("/nim/:nim", auth.authMiddleware, getMahasiswaByNim);

// Rute untuk memperbarui profil mahasiswa berdasarkan NIM (untuk mobile)
router.put("/nim/:nim", auth.authMiddleware, uploadMahasiswaSingle('image'), updateMahasiswaByNim);

// Rute untuk menghapus mahasiswa berdasarkan ID (untuk web admin)
router.delete("/id/:id", auth.authMiddleware, deleteMahasiswa);

export default router; 