import express from "express";
import { getAllPresensi } from "../controllers/presensi.controller.js";

const router = express.Router();

router.get("/", getAllPresensi);

export default router;