import { listSubscriptions, createSubscription } from "../repositories/subscription.repository";
import crypto from 'crypto'

export async function subscribe(url: string , events: string[]){
    const secret = crypto.randomBytes(32).toString('hex');
    return createSubscription(url , events , secret);
}

export async function getSubscriptions(){
    return listSubscriptions();
}