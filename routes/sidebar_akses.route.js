import express from "express";
import {
    getSidebarAksesByGroup,
    updateSidebarAkses
} from "../controllers/sidebar_akses.controller.js";

const router = express.Router();

router.get("/:group_id", getSidebarAksesByGroup);
router.put("/:group_id", updateSidebarAkses);

export default router;