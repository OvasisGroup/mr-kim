-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('CUSTOMER', 'VENDOR', 'SERVICE_PROVIDER', 'ADMIN');

-- CreateTable
CREATE TABLE "public"."OtpCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "identifier" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "consumed" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ServiceProviderProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "description" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceProviderProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "password" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'CUSTOMER',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VendorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessAddress" TEXT,
    "description" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OtpCode_identifier_type_idx" ON "public"."OtpCode"("identifier" ASC, "type" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceProviderProfile_userId_key" ON "public"."ServiceProviderProfile"("userId" ASC);

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email" ASC);

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "public"."User"("phone" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "public"."User"("phone" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "VendorProfile_userId_key" ON "public"."VendorProfile"("userId" ASC);

-- AddForeignKey
ALTER TABLE "public"."OtpCode" ADD CONSTRAINT "OtpCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceProviderProfile" ADD CONSTRAINT "ServiceProviderProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VendorProfile" ADD CONSTRAINT "VendorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

