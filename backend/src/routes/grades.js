const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { studentId, subjectId, semester, academicYear } = req.query;

    const where = {};
    if (studentId) where.studentId = studentId;
    if (subjectId) where.subjectId = subjectId;
    if (semester) where.semester = parseInt(semester);
    if (academicYear) where.academicYear = academicYear;

    const grades = await prisma.grade.findMany({
      where,
      include: {
        student: true,
        subject: true,
        teacher: { include: { user: true } },
      },
    });
    res.json(grades);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const grade = await prisma.grade.findUnique({
      where: { id: req.params.id },
      include: {
        student: true,
        subject: true,
        teacher: { include: { user: true } },
      },
    });

    if (!grade) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    res.json(grade);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, authorize('ADMIN', 'TEACHER'), async (req, res) => {
  try {
    const {
      studentId,
      subjectId,
      teacherId,
      semester,
      academicYear,
      midExam,
      finalExam,
      assignment,
      project,
      participation,
    } = req.body;

    console.log('Creating grade with data:', {
      studentId,
      subjectId,
      teacherId,
      semester,
      academicYear,
      midExam,
      finalExam,
      assignment,
      project,
      participation,
    });

    const finalScore =
      (midExam || 0) * 0.3 +
      (finalExam || 0) * 0.3 +
      (assignment || 0) * 0.2 +
      (project || 0) * 0.1 +
      (participation || 0) * 0.1;

    let grade = 'E';
    if (finalScore >= 90) grade = 'A';
    else if (finalScore >= 80) grade = 'B';
    else if (finalScore >= 70) grade = 'C';
    else if (finalScore >= 60) grade = 'D';

    const gradeData = await prisma.grade.create({
      data: {
        studentId,
        subjectId,
        teacherId,
        semester: parseInt(semester),
        academicYear,
        midExam,
        finalExam,
        assignment,
        project,
        participation,
        finalScore,
        grade,
      },
      include: {
        student: true,
        subject: true,
        teacher: { include: { user: true } },
      },
    });

    res.status(201).json(gradeData);
  } catch (error) {
    console.error('Error creating grade:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'TEACHER'), async (req, res) => {
  try {
    const {
      midExam,
      finalExam,
      assignment,
      project,
      participation,
      remarks,
    } = req.body;

    const finalScore =
      (midExam || 0) * 0.3 +
      (finalExam || 0) * 0.3 +
      (assignment || 0) * 0.2 +
      (project || 0) * 0.1 +
      (participation || 0) * 0.1;

    let grade = 'E';
    if (finalScore >= 90) grade = 'A';
    else if (finalScore >= 80) grade = 'B';
    else if (finalScore >= 70) grade = 'C';
    else if (finalScore >= 60) grade = 'D';

    const gradeData = await prisma.grade.update({
      where: { id: req.params.id },
      data: {
        midExam,
        finalExam,
        assignment,
        project,
        participation,
        finalScore,
        grade,
        remarks,
      },
      include: {
        student: true,
        subject: true,
        teacher: { include: { user: true } },
      },
    });

    res.json(gradeData);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN', 'TEACHER'), async (req, res) => {
  try {
    await prisma.grade.delete({ where: { id: req.params.id } });
    res.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
