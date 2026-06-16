/*
  Warnings:

  - Added the required column `educationLevel` to the `classes` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_classes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "gradeLevel" INTEGER NOT NULL,
    "educationLevel" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "homeroomTeacherId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "classes_homeroomTeacherId_fkey" FOREIGN KEY ("homeroomTeacherId") REFERENCES "teachers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_classes" ("academicYear", "createdAt", "gradeLevel", "homeroomTeacherId", "id", "name", "updatedAt", "educationLevel") SELECT "academicYear", "createdAt", "gradeLevel", "homeroomTeacherId", "id", "name", "updatedAt", 'SD' FROM "classes";
DROP TABLE "classes";
ALTER TABLE "new_classes" RENAME TO "classes";
CREATE UNIQUE INDEX "classes_name_key" ON "classes"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
