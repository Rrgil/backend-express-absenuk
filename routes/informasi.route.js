import express from "express";
import { 
    getAllInformasi,
    getInformasiById,
    createInformasi,
    updateInformasi,
    deleteInformasi
 } from "../controllers/informasi.controller.js";
import auth from "../middleware/verifyToken.js";
import { uploadInformasiSingle } from "../config/multer.config.js";

const router = express.Router();

router.get("/", auth.authMiddleware, getAllInformasi);
router.get("/:id", auth.authMiddleware, getInformasiById);
router.post("/", [auth.authMiddleware, uploadInformasiSingle('image')], createInformasi);
router.put("/:id", [auth.authMiddleware, uploadInformasiSingle('image')], updateInformasi);
router.delete("/:id", auth.authMiddleware, deleteInformasi);

export default router;