import express from "express";
import { getAllMahasiswa, 
    createMahasiswa, 
    loginMahasiswa, 
    logoutMahasiswa, 
    getMahasiswaById, 
    updateDataMahasiswa, 
    getMahasiswaByNim 
} from "../controllers/mahasiswa.controller.js";
import { uploadMahasiswaSingle } from "../config/multer.config.js";
import auth from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", getAllMahasiswa);
router.post("/", uploadMahasiswaSingle('image'), createMahasiswa);
router.post("/login", loginMahasiswa);
router.post("/logout", auth.authMiddleware, logoutMahasiswa);

// Rute untuk mendapatkan profil mahasiswa (membutuhkan otentikasi)
router.get("/profile", auth.authMiddleware, getMahasiswaById);

// Rute untuk memperbarui profil mahasiswa (membutuhkan otentikasi)
router.put("/profile", auth.authMiddleware, uploadMahasiswaSingle('image'), updateDataMahasiswa);

// Rute untuk mendapatkan mahasiswa berdasarkan NIM (membutuhkan otentikasi)
router.get("/nim/:nim", auth.authMiddleware, getMahasiswaByNim);

export default router;