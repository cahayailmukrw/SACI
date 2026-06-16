/*
  Warnings:

  - Added the required column `educationLevel` to the `subjects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `educationLevel` to the `teachers` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_subjects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "educationLevel" TEXT NOT NULL,
    "description" TEXT,
    "credits" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_subjects" ("category", "code", "createdAt", "credits", "description", "id", "name", "updatedAt", "educationLevel") SELECT "category", "code", "createdAt", "credits", "description", "id", "name", "updatedAt", 'SD' FROM "subjects";
DROP TABLE "subjects";
ALTER TABLE "new_subjects" RENAME TO "subjects";
CREATE UNIQUE INDEX "subjects_code_key" ON "subjects"("code");
CREATE TABLE "new_teachers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "nip" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "subject" TEXT,
    "educationLevel" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "teachers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_teachers" ("address", "createdAt", "id", "nip", "phone", "subject", "updatedAt", "userId", "educationLevel") SELECT "address", "createdAt", "id", "nip", "phone", "subject", "updatedAt", "userId", 'SD' FROM "teachers";
DROP TABLE "teachers";
ALTER TABLE "new_teachers" RENAME TO "teachers";
CREATE UNIQUE INDEX "teachers_userId_key" ON "teachers"("userId");
CREATE UNIQUE INDEX "teachers_nip_key" ON "teachers"("nip");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
