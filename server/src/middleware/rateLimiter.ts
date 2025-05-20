import { Request, Response, NextFunction } from "express";
import { RateLimiterMemory } from "rate-limiter-flexible";

const rateLimiter = new RateLimiterMemory({
  points: 10, // 10 requests
  duration: 60, // per 60 seconds
  execEvenly: false, // true for evenly distributed, false for sliding window
});

export default function rateLimiterMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.ip) {
    rateLimiter
      .consume(req?.ip)
      .then(() => next())
      .catch(() => {
        return res.status(429).json({ error: "Too many requests" });
      });
  }
}
