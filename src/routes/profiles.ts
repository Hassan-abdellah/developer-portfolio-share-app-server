import express from "express";
import {
  createProfile,
  deleteProfile,
  getMyProfile,
  getProfile,
  shareProfile,
  updateProfile,
  uploadProfileCSV,
} from "../controllers/profileContorller.js";
import { uploadPdf } from "../middlewares/upload.js";

const router = express.Router();

// CREATE Profile
router.post("/", createProfile);
// UPDATE Profile
router.put("/:id", updateProfile);
// GET My Profile
router.get("/me", getMyProfile);

// GET Profile
router.get("/:id", getProfile);

// UPDATE Profile sharable attribute
router.put("/:id/share", shareProfile);
// UPDATE Profile sharable attribute
router.put("/:id/upload-csv", uploadPdf.single("pdf"), uploadProfileCSV);
// DELETE Profile
router.delete("/:id", deleteProfile);

export default router;
