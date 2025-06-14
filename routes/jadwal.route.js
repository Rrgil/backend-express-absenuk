import express from "express";
import { getAllJadwal } from "../controllers/jadwal.controller.js";

const router = express.Router();

router.get("/", getAllJadwal);

export default router;