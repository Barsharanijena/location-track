import { ErrorRequestHandler, NextFunction, Request, Response } from "express";

export const errorHandler: ErrorRequestHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const status = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({ error: err.message ?? "Internal server error" });
};

export const notFound = (_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
};
