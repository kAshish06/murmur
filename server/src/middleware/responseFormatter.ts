import { Request, Response, NextFunction } from "express";

export default function responseformatter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const originalJson = res.json;

  res.json = function (data: unknown) {
    const httpStatusCode = res.statusCode;

    const formattedResponse = {
      status: httpStatusCode,
      result: data === undefined ? null : data,
    };

    return originalJson.call(this, formattedResponse);
  };
  next();
}
