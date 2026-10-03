/*
  Warnings:

  - A unique constraint covering the columns `[eventId,subscriptionId]` on the table `Delivery` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Delivery_eventId_subscriptionId_key" ON "Delivery"("eventId", "subscriptionId");
