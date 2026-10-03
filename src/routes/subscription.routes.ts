import { Router } from "express";
import { subscribeHandler , listSubscriptionsHandler } from "../controllers/subscription.controller";

const router  = Router();

router.post('/webhooks', subscribeHandler);
router.get('/webhooks', listSubscriptionsHandler);


export default router;