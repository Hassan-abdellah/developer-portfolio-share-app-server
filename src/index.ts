import "dotenv/config";
import express from "express";
import userRouter from "./routes/users.js";
import profileRouter from "./routes/profiles.js";
import projectRouter from "./routes/projects.js";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import rateLimit from "express-rate-limit";

// rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

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

// Add Clerk middleware globally (required)
app.use(
  clerkMiddleware({
    authorizedParties: ["http://localhost:5173"],
  }),
);

// users webhook
app.use("/webhooks/clerk", userRouter);

// parse body
app.use(express.json());
// rate limit
app.use(limiter);

// profile routes
app.use("/api/profiles", profileRouter);
app.use("/api/projects", projectRouter);

app.listen(PORT, () => console.log(`Server is Running on PORT ${PORT}`));
