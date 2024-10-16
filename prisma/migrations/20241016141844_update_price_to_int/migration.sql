-- CreateTable
CREATE TABLE "Price" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "manufacturer" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "price" INTEGER,
    "dateCollected" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Price_manufacturer_device_action_dateCollected_key" ON "Price"("manufacturer", "device", "action", "dateCollected");
