import { eventSchema } from "../schemas/event.schema";
import { publishEvent } from "../services/event.service";
import { Request , Response , NextFunction } from "express";

export async function publishEventHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = eventSchema.parse(req.body);
    const result = await publishEvent(parsed.type , parsed.payload);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}