import z from "zod";

export const subscribeSchema = z.object({
    url: z.url(),
    events: z.array(z.string()).min(1)
})

export type subscribeInput = z.infer<typeof subscribeSchema>