import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { HttpError } from "../lib/httpError";
import { logger } from "../lib/logger";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    const errors = err.issues.map((issue) => ({
      type: "ValidationError",
      msg: issue.message,
      path: issue.path.join("."),
      location: "body",
    }));
    logger.warn("Validation failed", { errors, path: req.path });
    return res.status(400).json({ errors });
  }

  if (err instanceof HttpError) {
    logger.warn(err.message, { statusCode: err.statusCode, path: req.path });
    return res.status(err.statusCode).json({ error: err.message });
  }

  logger.error(err.message, { stack: err.stack, path: req.path });
  return res.status(500).json({ error: "Internal server error" });
}