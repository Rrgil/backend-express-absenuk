import express from "express";
import { 
    getAllUsers, 
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    login,
    logout,
    getProfile,
    updateProfile,
    updatePassword
} from "../controllers/users.controller.js";
import auth from "../middleware/verifyToken.js";
import { uploadUserSingle } from "../config/multer.config.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", uploadUserSingle('image'), createUser);
router.put("/:id", uploadUserSingle('image'), updateUser);
router.delete("/:id", auth.authMiddleware, deleteUser);
router.post("/login", login);
router.post("/logout", auth.authMiddleware, logout);

// Route untuk profile
router.get("/profile/me", auth.authMiddleware, getProfile);
router.put("/profile/update", auth.authMiddleware, uploadUserSingle('image'), updateProfile);
router.put("/profile/password", auth.authMiddleware, updatePassword);

export default router;