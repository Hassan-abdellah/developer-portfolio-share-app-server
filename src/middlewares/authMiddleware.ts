import { getAuth } from "@clerk/express";
import { Request, Response } from "express";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: CallableFunction,
) => {
  const { userId: clerkId } = getAuth(req);

  if (!clerkId) {
    return res.status(401).json({ message: "unauthenticated" });
  }

  next();
};
