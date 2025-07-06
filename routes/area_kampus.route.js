import express from "express";
import {
    getAllAreaKampus,
    getAreaKampusById,
    createAreaKampus,
    updateAreaKampus,
    deleteAreaKampus,
} from "../controllers/area_kampus.controller.js";

const router = express.Router();

router.get("/", getAllAreaKampus);
router.get("/:id", getAreaKampusById);
router.post("/", createAreaKampus);
router.put("/:id", updateAreaKampus);
router.delete("/:id", deleteAreaKampus);

export default router;
