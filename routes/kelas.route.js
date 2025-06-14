import express from "express";
import { 
    getAllKelas,
    getKelasById,
    createKelas,
    updateKelas,
    deleteKelas
 } from "../controllers/kelas.controller.js";

const router = express.Router();

router.get("/", getAllKelas);
router.get("/:id", getKelasById);
router.post("/", createKelas);
router.put("/:id", updateKelas);
router.delete("/:id", deleteKelas);

export default router;