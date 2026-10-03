import { Delivery , DeliveryStatus} from "@prisma/client";
import prisma from "../db";

export async function findOrCreateDelivery(eventId: number, subscriptionId: number): Promise<Delivery> {
  const delivery = await prisma.delivery.upsert({
    where: {
      eventId_subscriptionId: { eventId, subscriptionId }, // composite unique key
    },
    update: {}, // if exists, don't change anything here (just return existing)
    create: { eventId, subscriptionId },
  });
  return delivery;
}

export async function updateDeliveryStatus(deliveryId: number, status: DeliveryStatus, responseCode: number, aiSummary?: string): Promise<Delivery>{
    const updateDeliveryStatus = await prisma.delivery.update({
        where: {
            id: deliveryId
        },
        data: {
            status: status,
            responseCode: responseCode,
            attempts: {increment: 1},
            ...(aiSummary && { aiSummary }),
        }
    });

    return updateDeliveryStatus;
}

export async function findDeliveryById(id: number): Promise<Delivery | null> {
  const deliveryData = await prisma.delivery.findUnique({where: {id}});
  return deliveryData;
}

export async function listDeliveries(filters: { status?: DeliveryStatus; subscriptionId?: number }, limit: number): Promise<Delivery[]> {
  const deliveryList = await prisma.delivery.findMany({
    where: { 
      status: filters.status,
      subscriptionId: filters.subscriptionId,
    },
    take: limit,
  });

  return deliveryList;
}
