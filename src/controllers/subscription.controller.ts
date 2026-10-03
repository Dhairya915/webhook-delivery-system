import { HttpError } from "../lib/httpError";
import { subscribe , getSubscriptions } from "../services/subscription.service";
import { subscribeSchema } from "../schemas/subscription.schema";
import { Request , Response , NextFunction } from "express";

export async function subscribeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = subscribeSchema.parse(req.body);
    const addSubscibe = await subscribe(parsed.url , parsed.events);
    res.status(201).json(addSubscibe);
  } catch (err) {
    next(err);
  }
}

export async function listSubscriptionsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const listOfSubscibe = await getSubscriptions();
    res.status(200).json(listOfSubscibe);
  } catch (err) {
    next(err);
  }
}