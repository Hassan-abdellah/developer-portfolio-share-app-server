import "dotenv/config";
import express from "express";
import userRouter from "./routes/users.js";
import profileRouter from "./routes/profiles.js";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";

const PORT = process.env.PORT || 8000;
// initialize express
const app = express();
// cors
app.use(cors());
// parse body
app.use(express.json());
// Add Clerk middleware globally (required)
app.use(clerkMiddleware());
// users webhook
app.use("/webhooks/clerk", userRouter);
// profile routes
app.use("/api/profiles", profileRouter);

app.listen(PORT, () => console.log(`Server is Running on PORT ${PORT}`));
