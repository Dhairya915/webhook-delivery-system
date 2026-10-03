import { Router } from "express";
import { getDeliveryByIdHandler, listDeliveriesHandler, replayDeliveryHandler } from "../controllers/delivery.controller";

const router = Router();

router.get('/deliveries', listDeliveriesHandler);
router.get('/deliveries/:id', getDeliveryByIdHandler);
router.post('/deliveries/:id/replay', replayDeliveryHandler);

export default router;