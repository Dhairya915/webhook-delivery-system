import express from 'express';
import subscriptionRouter from './routes/subscription.routes';
import eventRouter from './routes/event.routes';
import deliveryRouter from './routes/delivery.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(express.json());
app.use(subscriptionRouter);
app.use(eventRouter);
app.use(deliveryRouter);
app.use(errorHandler);

export default app;