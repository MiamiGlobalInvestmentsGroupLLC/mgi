
CREATE TABLE "Company" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TABLE "Chat" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Chat_company_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id")
);
CREATE TABLE "Message" (
  "id" TEXT PRIMARY KEY,
  "chatId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Message_chat_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id")
);
CREATE TABLE "Usage" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "day" DATE NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Usage_company_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id")
);
CREATE UNIQUE INDEX "Usage_company_day_key" ON "Usage"("companyId","day");
