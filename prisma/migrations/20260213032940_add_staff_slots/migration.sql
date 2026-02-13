-- CreateTable
CREATE TABLE "staff_slots" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "staff_slots_staffId_idx" ON "staff_slots"("staffId");

-- CreateIndex
CREATE INDEX "staff_slots_startAt_idx" ON "staff_slots"("startAt");

-- CreateIndex
CREATE UNIQUE INDEX "staff_slots_staffId_startAt_key" ON "staff_slots"("staffId", "startAt");

-- AddForeignKey
ALTER TABLE "staff_slots" ADD CONSTRAINT "staff_slots_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;
