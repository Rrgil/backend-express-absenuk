import express from "express";
import {
    getKonfigurasiUmum,
    updateKonfigurasi
} from "../controllers/configurasi_umum.controller.js";
import { uploadConfigurasiSingle } from "../config/multer.config.js";

const router = express.Router();

router.get("/", getKonfigurasiUmum);
router.put("/update", uploadConfigurasiSingle('icon'), updateKonfigurasi);

export default router;
