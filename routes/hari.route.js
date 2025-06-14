import express from "express";
import { 
    getAllHari,
    getHariById,
    createHari,
    updateHari,
    deleteHari 
} from "../controllers/hari.controller.js";

const router = express.Router();

router.get("/", getAllHari);
router.get("/:id", getHariById);
router.post("/", createHari);
router.put("/:id", updateHari);
router.delete("/:id", deleteHari);

export default router;