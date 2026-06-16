const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { studentId, date, status } = req.query;

    const where = {};
    if (studentId) where.studentId = studentId;
    if (date) where.date = new Date(date);
    if (status) where.status = status;

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        student: true,
        teacher: { include: { user: true } },
      },
      orderBy: { date: 'desc' },
    });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, authorize('ADMIN', 'TEACHER'), async (req, res) => {
  try {
    const { studentId, teacherId, date, status, notes } = req.body;

    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        teacherId,
        date: new Date(date),
        status: status.toUpperCase(),
        notes,
      },
      include: {
        student: true,
        teacher: { include: { user: true } },
      },
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'TEACHER'), async (req, res) => {
  try {
    const { status, notes } = req.body;

    const attendance = await prisma.attendance.update({
      where: { id: req.params.id },
      data: {
        status: status ? status.toUpperCase() : undefined,
        notes,
      },
      include: {
        student: true,
        teacher: { include: { user: true } },
      },
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN', 'TEACHER'), async (req, res) => {
  try {
    await prisma.attendance.delete({ where: { id: req.params.id } });
    res.json({ message: 'Attendance deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
