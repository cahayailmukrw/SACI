const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get all report cards with filtering
router.get('/', authenticate, async (req, res) => {
  try {
    const { studentId, semester, academicYear, classId, isPublished } = req.query;
    
    const where = {};
    if (studentId) where.studentId = studentId;
    if (semester) where.semester = parseInt(semester);
    if (academicYear) where.academicYear = academicYear;
    if (classId) where.classId = classId;
    if (isPublished !== undefined) where.isPublished = isPublished === 'true';

    const reportCards = await prisma.reportCard.findMany({
      where,
      include: {
        student: {
          include: {
            parent: true
          }
        },
        class: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(reportCards);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single report card by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const reportCard = await prisma.reportCard.findUnique({
      where: { id: req.params.id },
      include: {
        student: {
          include: {
            parent: true
          }
        },
        class: true
      }
    });

    if (!reportCard) {
      return res.status(404).json({ error: 'Report card not found' });
    }

    res.json(reportCard);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new report card
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      studentId,
      semester,
      academicYear,
      classId,
      classRank,
      gradeAverage,
      behaviorGrade,
      behaviorNotes,
      attendanceRate,
      totalAbsence,
      principalNotes,
      parentNotes
    } = req.body;

    const reportCard = await prisma.reportCard.create({
      data: {
        studentId,
        semester: parseInt(semester),
        academicYear,
        classId,
        classRank: classRank ? parseInt(classRank) : null,
        gradeAverage: gradeAverage ? parseFloat(gradeAverage) : null,
        behaviorGrade,
        behaviorNotes,
        attendanceRate: attendanceRate ? parseFloat(attendanceRate) : null,
        totalAbsence: totalAbsence ? parseInt(totalAbsence) : null,
        principalNotes,
        parentNotes
      },
      include: {
        student: {
          include: {
            parent: true
          }
        },
        class: true
      }
    });

    res.status(201).json(reportCard);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update report card
router.put('/:id', authenticate, async (req, res) => {
  try {
    const {
      semester,
      academicYear,
      classId,
      classRank,
      gradeAverage,
      behaviorGrade,
      behaviorNotes,
      attendanceRate,
      totalAbsence,
      principalNotes,
      parentNotes,
      isPublished
    } = req.body;

    const reportCard = await prisma.reportCard.update({
      where: { id: req.params.id },
      data: {
        semester: semester ? parseInt(semester) : undefined,
        academicYear,
        classId,
        classRank: classRank ? parseInt(classRank) : undefined,
        gradeAverage: gradeAverage ? parseFloat(gradeAverage) : undefined,
        behaviorGrade,
        behaviorNotes,
        attendanceRate: attendanceRate ? parseFloat(attendanceRate) : undefined,
        totalAbsence: totalAbsence ? parseInt(totalAbsence) : undefined,
        principalNotes,
        parentNotes,
        isPublished: isPublished !== undefined ? isPublished : undefined,
        publishedAt: isPublished === true ? new Date() : undefined
      },
      include: {
        student: {
          include: {
            parent: true
          }
        },
        class: true
      }
    });

    res.json(reportCard);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete report card
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await prisma.reportCard.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Report card deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Publish report card
router.patch('/:id/publish', authenticate, async (req, res) => {
  try {
    const reportCard = await prisma.reportCard.update({
      where: { id: req.params.id },
      data: {
        isPublished: true,
        publishedAt: new Date()
      },
      include: {
        student: {
          include: {
            parent: true
          }
        },
        class: true
      }
    });

    res.json(reportCard);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
