import { getAuth } from "@clerk/express";
import { Request, Response } from "express";

export const requireAuth = (req: Request, res: Response): string | null => {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) {
    res.status(401).json({ status: false, message: "unauthenticated" });
    return null;
  }
  return clerkId;
};
