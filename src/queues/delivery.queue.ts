import { Queue } from "bullmq";
import { env } from "../config/env";

export const deliveryQueue = new Queue('delivery', {
    connection: { url: env.REDIS_URL},
});