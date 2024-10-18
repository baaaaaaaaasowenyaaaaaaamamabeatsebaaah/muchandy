-- DropIndex
DROP INDEX "Device_name_manufacturerId_key";

-- CreateIndex
CREATE INDEX "Action_name_deviceId_idx" ON "Action"("name", "deviceId");

-- CreateIndex
CREATE INDEX "Device_name_manufacturerId_idx" ON "Device"("name", "manufacturerId");
