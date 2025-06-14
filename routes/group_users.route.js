import express from "express";
import { 
    getAllGroupUsers, 
    getGroupUsersById, 
    createGroupUsers, 
    updateGroupUsers, 
    deleteGroupUsers 
} from "../controllers/group_users.controller.js";

const router = express.Router();

router.get("/", getAllGroupUsers);
router.get("/:id", getGroupUsersById);
router.post("/", createGroupUsers);
router.put("/:id", updateGroupUsers);
router.delete("/:id", deleteGroupUsers);

export default router;