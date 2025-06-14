import express from "express";
import { 
    getAllProdi,
    getProdiById,
    createProdi,
    updateProdi,
    deleteProdi
 } from "../controllers/prodi.controller.js";

const router = express.Router();

router.get("/", getAllProdi);
router.get("/:id", getProdiById);
router.post("/", createProdi);
router.put("/:id", updateProdi);
router.delete("/:id", deleteProdi);

export default router;