import express from "express";
import { uploadImage } from "../middlewares/upload.js";
import {
  createProject,
  deleteProject,
  getProfileProjects,
  getProject,
  updateProject,
} from "../controllers/projectsController.js";

const router = express.Router();

// CREATE Project
router.post("/", uploadImage.single("image"), createProject);
// GET Project
router.get("/:id", getProject);
// GET Projects
router.get("/", getProfileProjects);
// UPDATE Project
router.put("/:id", uploadImage.single("image"), updateProject);
// DELETE Project
router.delete("/:id", deleteProject);
export default router;
