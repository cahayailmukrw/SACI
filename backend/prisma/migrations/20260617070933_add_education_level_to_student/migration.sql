-- AlterTable
ALTER TABLE "students" ADD COLUMN     "educationLevel" TEXT;

-- Update existing students with default education level based on their class
UPDATE "students" s
SET "educationLevel" = c."educationLevel"
FROM "classes" c
WHERE s."classId" = c.id;

-- Make the column required after setting default values
ALTER TABLE "students" ALTER COLUMN "educationLevel" SET NOT NULL;
