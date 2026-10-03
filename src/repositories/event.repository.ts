import { Event , Subscription} from "@prisma/client";
import prisma from "../db";

export async function createEvent(type: string, payload:  Record<string, any>): Promise<Event> {
    const event = await prisma.event.create({ data: { type,payload }});
    return event;
}

export async function findMatchingSubscriptions(eventType: string): Promise<Subscription[] >{
    const subscribers = await prisma.subscription.findMany({
        where:{
            events: {has: eventType},
            active: true,
        }
    });
    return subscribers;
}

export async function findEventById(id: number): Promise<Event | null>{
    const fetchedEvent = await prisma.event.findUnique({where : {id}});
    return fetchedEvent;
}