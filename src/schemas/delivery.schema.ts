import z from "zod";

export const listDeliveriesQuerySchema = z.object({
    status: z.enum(['pending', 'success', 'failed', 'dead_letter']).optional(),
    subscriptionId: z.coerce.number().optional(),
    limit: z.coerce.number().default(10),
});

export type listDeliveriesInput = z.infer<typeof listDeliveriesQuerySchema>
