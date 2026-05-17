import { Request, Response } from "express";

export const isRequestParamsMissing = (
  req: Request,
  res: Response,
  modelName: string,
): string | null => {
  const paramId = req.params.id as string;
  if (!paramId) {
    res.status(400).json({ status: false, message: `Missing ${modelName} ID` });
    return null;
  }
  return paramId;
};
