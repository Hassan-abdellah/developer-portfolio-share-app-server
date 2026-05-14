import "dotenv/config";
import express from "express";
import userRouter from "./routes/users.js";
import profileRouter from "./routes/profiles.js";
import { clerkMiddleware, getAuth } from "@clerk/express";
import cors from "cors";
import { getProfile } from "./controllers/profileContorller.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";

const PORT = process.env.PORT || 8000;
// initialize express
const app = express();

// cors
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend origin
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  }),
);
// parse body
app.use(express.json());

// Add Clerk middleware globally (required)
app.use(
  clerkMiddleware({
    authorizedParties: ["http://localhost:5173"],
  }),
);

// custom auth middleware

// app.use(authMiddleware);
// users webhook
app.use("/webhooks/clerk", userRouter);

// profile routes
app.use("/api/profiles", profileRouter);

app.listen(PORT, () => console.log(`Server is Running on PORT ${PORT}`));
