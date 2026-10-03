import { Request, Response, NextFunction } from "express";
import { getDeliveryById , getDeliveries , replayDelivery} from "../services/delivery.service";
import { listDeliveriesQuerySchema } from "../schemas/delivery.schema";
import { HttpError } from "../lib/httpError";

export async function getDeliveryByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const result = await getDeliveryById(id);
    
    if (!result) {
      throw new HttpError(404, "Delivery not found");
    }
    
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function listDeliveriesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = listDeliveriesQuerySchema.parse(req.query);
    const filters = {status: parsed.status , subscriptionId :parsed.subscriptionId};
    const result = await getDeliveries(filters , parsed.limit);
    res.status(200).json(result);
  } catch(err){
    next(err)
  }
}  

export async function replayDeliveryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const result = await replayDelivery(id);
    res.status(200).json(result);
  } catch(err){
    next(err)
  }
} 