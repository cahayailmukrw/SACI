-- CreateTable
CREATE TABLE "report_cards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "academicYear" TEXT NOT NULL,
    "classId" TEXT,
    "classRank" INTEGER,
    "gradeAverage" REAL,
    "behaviorGrade" TEXT,
    "behaviorNotes" TEXT,
    "attendanceRate" REAL,
    "totalAbsence" INTEGER,
    "principalNotes" TEXT,
    "parentNotes" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "report_cards_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "report_cards_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "student_affairs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "severity" TEXT NOT NULL,
    "points" INTEGER,
    "actionTaken" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" DATETIME,
    "resolvedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "student_affairs_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "extracurriculars" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "schedule" TEXT,
    "instructor" TEXT,
    "fee" REAL,
    "maxStudents" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "extracurricular_enrollments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "extracurricularId" TEXT NOT NULL,
    "enrollmentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "grade" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "extracurricular_enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "extracurricular_enrollments_extracurricularId_fkey" FOREIGN KEY ("extracurricularId") REFERENCES "extracurriculars" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "report_cards_studentId_semester_academicYear_key" ON "report_cards"("studentId", "semester", "academicYear");

-- CreateIndex
CREATE UNIQUE INDEX "extracurricular_enrollments_studentId_extracurricularId_key" ON "extracurricular_enrollments"("studentId", "extracurricularId");
