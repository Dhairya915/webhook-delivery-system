import { eventSchema } from '../schemas/event.schema';

describe('eventSchema', () => {
  it('should accept valid input', () => {
    const result = eventSchema.safeParse({
        type: 'order.created',
        payload: { orderId: 123 }
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty type', () => {
    const result = eventSchema.safeParse({
        type: '',
        payload: { orderId: 123 }
    });
    expect(result.success).toBe(false);
  });
});