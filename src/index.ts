import "dotenv/config";
import express from "express";
import userRouter from "./routes/users.js";

const PORT = process.env.PORT || 8000;

const app = express();

app.use("/webhooks/clerk", userRouter);

app.listen(PORT, () => console.log(`Server is Running on PORT ${PORT}`));
