import { Request, Response, NextFunction } from "express";
import xss from "xss";

function sanitizeAndNormalize(obj: any): any {
  if (typeof obj === "string") {
    let value = obj.trim();
    if (/^[^@]+@[^@]+\.[^@]+$/.test(value)) {
      value = value.toLowerCase();
    }
    return xss(value);
  } else if (Array.isArray(obj)) {
    return obj.map(sanitizeAndNormalize);
  } else if (typeof obj === "object" && obj !== null) {
    const sanitized: any = {};
    for (const key in obj) {
      sanitized[key] = sanitizeAndNormalize(obj[key]);
    }
    return sanitized;
  }
  return obj;
}
export default function sanitizeBodyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.method === "POST" || req.method === "PATCH") {
    req.body = sanitizeAndNormalize(req.body);
  }
  next();
}
