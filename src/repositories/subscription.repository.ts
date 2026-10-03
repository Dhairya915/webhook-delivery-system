import { Subscription } from '@prisma/client';
import prisma from '../db';

export async function createSubscription(url: string, events: string[], secret: string): Promise<Subscription> {
  const sub = await prisma.subscription.create({ data: {url , events , secret} });
  return sub;
}

export async function listSubscriptions(): Promise<Subscription[]>  {
  const list = await prisma.subscription.findMany();
  return list;
}

export async function findSubscriptionById(id: number): Promise<Subscription | null> {
  const fetchedSubscriber = await prisma.subscription.findUnique({where: {id}});
  return fetchedSubscriber;
}

export async function incrementFailureCount(subscriptionId: number){
  const subscription = await prisma.subscription.update({where: {id: subscriptionId} , data:{ consecutiveFailures: { increment: 1 } } , });

  if(subscription.consecutiveFailures >= 3){
    await prisma.subscription.update({
      where: { id: subscriptionId},
      data: { active: false},
    })
  }

  return subscription;
}

export async function resetFailureCount(subscriptionId: number){
  const resetCount = await prisma.subscription.update({
    where: { id: subscriptionId},
    data: { consecutiveFailures: 0}
  })

  return resetCount;
}