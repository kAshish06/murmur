import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export default function logApiMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const user = (req as any).user || {};
    const logData = {
      method: req.method,
      endpoint: req.originalUrl,
      user: user.id || req.ip,
      status: res.statusCode,
      durationMs: duration,
    };

    if (res.statusCode >= 500) {
      logger.error(logData);
    } else if (res.statusCode >= 400) {
      logger.warn(logData);
    } else {
      logger.info(logData);
    }
  });
  next();
}
