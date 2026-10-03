import { Router } from "express";
import { publishEventHandler } from "../controllers/event.controller";

const router  = Router();

router.post('/events', publishEventHandler);

export default router;