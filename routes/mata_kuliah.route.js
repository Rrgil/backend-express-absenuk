import express from "express";
import { 
    getAllMataKuliah,
    getMataKuliahById,
    createMataKuliah,
    updateMataKuliah,
    deleteMataKuliah
 } from "../controllers/mata_kuliah.controller.js";

const router = express.Router();

router.get("/", getAllMataKuliah);
router.get("/:id", getMataKuliahById);
router.post("/", createMataKuliah);
router.put("/:id", updateMataKuliah);
router.delete("/:id", deleteMataKuliah);

export default router;