import { Worker } from "bullmq";
import { env } from "./config/env";
import axios from "axios";
import crypto from 'crypto';
import { findEventById } from "./repositories/event.repository";
import { findSubscriptionById, incrementFailureCount, resetFailureCount } from "./repositories/subscription.repository";
import { findOrCreateDelivery, updateDeliveryStatus } from "./repositories/delivery.repository";
import { generateFailureSummary } from "./services/ai.service";

const queueName = "delivery";

const worker = new Worker(
  queueName,
  async (job) => {
    console.log(`Processing job ${job.id}`, job.data);

    const { eventId, subscriptionId } = job.data;

    const event = await findEventById(eventId);
    const subscription = await findSubscriptionById(subscriptionId);

    if (!event || !subscription) {
      console.log(`Skipping job - event or subscription not found`);
      return; // or throw, depending on desired behavior
    }

    const delivery = await findOrCreateDelivery(eventId , subscriptionId);

    const payloadToSend = { type: event.type, payload: event.payload };

    const signature = crypto
                        .createHmac('sha256',subscription.secret)
                        .update(JSON.stringify(payloadToSend))
                        .digest('hex');

    try{

      const response = await axios.post(subscription.url, payloadToSend, {
          headers: {  
            'X-Signature': signature,
            'X-Idempotency-Key': delivery.id.toString(),
          },
      });

      await updateDeliveryStatus(delivery.id , 'success' , response.status);
      await resetFailureCount(subscriptionId);
    }
    catch(err:any){

      const responseCode = err.response?.status ?? 0;
      console.log('attemptsMade:', job.attemptsMade, 'maxAttempts:', job.opts.attempts);

      const isLastAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 1);
      const status = isLastAttempt ? 'dead_letter' : 'failed';

      let aiSummary: string | undefined;

      if(status === 'dead_letter'){
        await incrementFailureCount(subscriptionId);
        aiSummary = await generateFailureSummary(responseCode,job.attemptsMade+1,subscription.url);
      }
      await updateDeliveryStatus(delivery.id , status , responseCode , aiSummary );
       console.log('AI Summary generated:', aiSummary);  
      throw err;

    }
  },
  {
    connection: { url: env.REDIS_URL },
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.log(`Job ${job?.id} failed:`, err.message);
});
