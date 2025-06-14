import express from "express";
import {
    getAllSidebar,
    getUserSidebar
} from "../controllers/sidebar.controller.js";

const router = express.Router();

router.get("/", getAllSidebar);
router.get("/user-menu", getUserSidebar);

export default router;