const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { studentId, status } = req.query;

    const where = {};
    if (studentId) where.studentId = studentId;
    if (status) where.status = status;

    const tahfidz = await prisma.tahfidz.findMany({
      where,
      include: { student: true },
      orderBy: { date: 'desc' },
    });
    res.json(tahfidz);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const tahfidz = await prisma.tahfidz.findUnique({
      where: { id: req.params.id },
      include: { student: true },
    });

    if (!tahfidz) {
      return res.status(404).json({ error: 'Tahfidz record not found' });
    }

    res.json(tahfidz);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, authorize('ADMIN', 'TEACHER'), async (req, res) => {
  try {
    const { studentId, surah, ayatFrom, ayatTo, juz, status, notes } = req.body;

    const tahfidz = await prisma.tahfidz.create({
      data: {
        studentId,
        surah,
        ayatFrom,
        ayatTo,
        juz,
        status: status.toUpperCase(),
        notes,
      },
      include: { student: true },
    });

    res.status(201).json(tahfidz);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'TEACHER'), async (req, res) => {
  try {
    const { status, notes } = req.body;

    const tahfidz = await prisma.tahfidz.update({
      where: { id: req.params.id },
      data: {
        status: status ? status.toUpperCase() : undefined,
        notes,
      },
      include: { student: true },
    });

    res.json(tahfidz);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN', 'TEACHER'), async (req, res) => {
  try {
    await prisma.tahfidz.delete({ where: { id: req.params.id } });
    res.json({ message: 'Tahfidz record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
