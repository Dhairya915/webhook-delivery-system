import { deliveryQueue } from "../queues/delivery.queue";
import { createEvent , findMatchingSubscriptions } from "../repositories/event.repository";


export async function publishEvent(type: string, payload: Record<string, any>) {
  const event = await createEvent(type, payload);
  const matchedSubscribers = await findMatchingSubscriptions(type);

  for(const subscriber of matchedSubscribers) {
    await deliveryQueue.add('deliver', 
    { eventId: event.id, subscriptionId: subscriber.id },
    { 
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    }
    );
  }
  
  return { event, matchedSubscribers };
}