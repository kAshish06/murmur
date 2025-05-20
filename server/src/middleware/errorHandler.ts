import { Request, Response, NextFunction } from "express";
import { logger } from "./logger"; // Assuming you have a logger utility

export default function errorHandlerMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    endpoint: req.originalUrl,
    user: (req as any).user?.id || req.ip,
  });

  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message;

  res.status(status).json({ error: message });
}
