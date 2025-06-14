import express from "express";
import { 
    getAllDosen,
    getDosenById,
    createDosen,
    updateDosen,
    deleteDosen
 } from "../controllers/dosen.controller.js";

const router = express.Router();

router.get("/", getAllDosen);
router.get("/:id", getDosenById);
router.post("/", createDosen);
router.put("/:id", updateDosen);
router.delete("/:id", deleteDosen);

export default router;