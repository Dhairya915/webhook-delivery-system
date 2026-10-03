import { subscribeSchema } from '../schemas/subscription.schema';

describe('subscribeSchema', () => {
  it('should accept valid input', () => {
    const result = subscribeSchema.safeParse({
      url: 'https://example.com/hook',
      events: ['order.created'],
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid url', () => {
    const result = subscribeSchema.safeParse({
      url: 'not-a-url',
      events: ['order.created'],
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty events array', () => {
    const result = subscribeSchema.safeParse({
      url: 'https://example.com/hook',
      events: [],
    });
    expect(result.success).toBe(false);
  });
});