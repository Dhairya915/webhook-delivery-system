import { Subscription, Event } from "@prisma/client";
import {
  findDeliveryById,
  listDeliveries,
} from "../repositories/delivery.repository";
import axios from "axios";
import { deliveryQueue } from "../queues/delivery.queue";
import { HttpError } from "../lib/httpError";
import { DeliveryStatus } from "@prisma/client";

export async function deliverEvent(subscribers: Subscription[], event: Event) {
  for (const subscriber of subscribers) {
    try {
      await axios.post(subscriber.url, {
        type: event.type,
        payload: event.payload,
      });
      console.log(`Delivered to ${subscriber.url}`);
    } catch (err) {
      console.log(`Failed to deliver to ${subscriber.url}`);
    }
  }
}

export async function replayDelivery(id: number) {
  const deliveryData = await findDeliveryById(id);
  
  if (!deliveryData) {
    throw new HttpError(404, "Delivery not found");
  }

  await deliveryQueue.add('deliver', {
    eventId: deliveryData.eventId,
    subscriptionId: deliveryData.subscriptionId,
  }, {
    attempts: 5,
    backoff: { type: 'exponential', delay: 1000 },
  });

  return deliveryData;
}


export async function getDeliveryById(id: number) {
  const delivery = await findDeliveryById(id);
  return delivery;
}

export async function getDeliveries(filters: { status?: DeliveryStatus; subscriptionId?: number }, limit: number){
  const listOfDeliveries = await listDeliveries(filters , limit);
  return listOfDeliveries
}