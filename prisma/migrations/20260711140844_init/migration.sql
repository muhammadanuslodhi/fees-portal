-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Area" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "areaName" TEXT NOT NULL,
    "chairmanName" TEXT NOT NULL,
    "chairmanSignature" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "memberName" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "cnic" TEXT,
    "dateOfBirth" DATETIME,
    "phoneNo" TEXT,
    "address" TEXT,
    "areaId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Member_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FeeRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL DEFAULT 0,
    "pendingAmount" INTEGER NOT NULL DEFAULT 0,
    "januaryPaid" BOOLEAN NOT NULL DEFAULT false,
    "januaryAmount" INTEGER NOT NULL DEFAULT 0,
    "februaryPaid" BOOLEAN NOT NULL DEFAULT false,
    "februaryAmount" INTEGER NOT NULL DEFAULT 0,
    "marchPaid" BOOLEAN NOT NULL DEFAULT false,
    "marchAmount" INTEGER NOT NULL DEFAULT 0,
    "aprilPaid" BOOLEAN NOT NULL DEFAULT false,
    "aprilAmount" INTEGER NOT NULL DEFAULT 0,
    "mayPaid" BOOLEAN NOT NULL DEFAULT false,
    "mayAmount" INTEGER NOT NULL DEFAULT 0,
    "junePaid" BOOLEAN NOT NULL DEFAULT false,
    "juneAmount" INTEGER NOT NULL DEFAULT 0,
    "julyPaid" BOOLEAN NOT NULL DEFAULT false,
    "julyAmount" INTEGER NOT NULL DEFAULT 0,
    "augustPaid" BOOLEAN NOT NULL DEFAULT false,
    "augustAmount" INTEGER NOT NULL DEFAULT 0,
    "septemberPaid" BOOLEAN NOT NULL DEFAULT false,
    "septemberAmount" INTEGER NOT NULL DEFAULT 0,
    "octoberPaid" BOOLEAN NOT NULL DEFAULT false,
    "octoberAmount" INTEGER NOT NULL DEFAULT 0,
    "novemberPaid" BOOLEAN NOT NULL DEFAULT false,
    "novemberAmount" INTEGER NOT NULL DEFAULT 0,
    "decemberPaid" BOOLEAN NOT NULL DEFAULT false,
    "decemberAmount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FeeRecord_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Zakat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT '',
    "year" INTEGER NOT NULL,
    "amount" REAL NOT NULL DEFAULT 0,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Fitra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT '',
    "year" INTEGER NOT NULL,
    "persons" INTEGER NOT NULL DEFAULT 1,
    "amountPerPerson" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Atiya" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT '',
    "year" INTEGER NOT NULL,
    "amount" REAL NOT NULL DEFAULT 0,
    "purpose" TEXT NOT NULL DEFAULT '',
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "fatherName" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Member_memberId_key" ON "Member"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_cnic_key" ON "Member"("cnic");

-- CreateIndex
CREATE UNIQUE INDEX "FeeRecord_memberId_year_key" ON "FeeRecord"("memberId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Zakat_name_year_key" ON "Zakat"("name", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Fitra_name_year_key" ON "Fitra"("name", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Atiya_name_year_key" ON "Atiya"("name", "year");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
