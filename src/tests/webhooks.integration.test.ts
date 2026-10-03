import request from 'supertest';
import app from '../app';
import prisma from '../db';

afterAll(async () => {
  await prisma.$disconnect();
});


describe('POST /webhooks', () => {
    it('should create a subscription', async () => {
        const response = await request(app).post('/webhooks').send({
            url:'https://example.com/hook',
            events: ['order.created'],
        });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.url).toBe('https://example.com/hook');
    });
})

describe('POST /events', () => {
  it('should create an event and return matched subscribers', async () => {
    const response = await request(app).post('/events').send({
            type:'order.created',
            payload: {orderId: 123},
        });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('event');
        expect(response.body.event).toHaveProperty('id');
        expect(response.body).toHaveProperty('matchedSubscribers');
        expect(Array.isArray(response.body.matchedSubscribers)).toBe(true);

  });
});
