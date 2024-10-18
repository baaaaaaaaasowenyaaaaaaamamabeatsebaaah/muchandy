/*
  Warnings:

  - You are about to drop the column `action` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `device` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturer` on the `Price` table. All the data in the column will be lost.
  - Added the required column `actionId` to the `Price` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Manufacturer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Device" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "manufacturerId" INTEGER NOT NULL,
    CONSTRAINT "Device_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Action" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "deviceId" INTEGER NOT NULL,
    CONSTRAINT "Action_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Price" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "actionId" INTEGER NOT NULL,
    "price" INTEGER,
    "dateCollected" DATETIME NOT NULL,
    CONSTRAINT "Price_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Price" ("dateCollected", "id", "price") SELECT "dateCollected", "id", "price" FROM "Price";
DROP TABLE "Price";
ALTER TABLE "new_Price" RENAME TO "Price";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Manufacturer_name_key" ON "Manufacturer"("name");
