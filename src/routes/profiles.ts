import express from "express";
import { createProfile } from "../controllers/profileContorller";

const router = express.Router();
router.post("/", createProfile);

export default router;
