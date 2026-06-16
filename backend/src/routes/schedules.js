const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { classId, day, academicYear } = req.query;
    const where = {};
    if (classId) where.classId = classId;
    if (day) where.day = day;
    if (academicYear) where.academicYear = academicYear;

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        class: true,
        subject: true,
        teacher: { include: { user: true } },
      },
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: req.params.id },
      include: {
        class: true,
        subject: true,
        teacher: { include: { user: true } },
      },
    });

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { classId, subjectId, teacherId, day, startTime, endTime, room, academicYear } = req.body;

    const schedule = await prisma.schedule.create({
      data: {
        classId,
        subjectId,
        teacherId,
        day,
        startTime,
        endTime,
        room,
        academicYear,
      },
      include: {
        class: true,
        subject: true,
        teacher: { include: { user: true } },
      },
    });

    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { classId, subjectId, teacherId, day, startTime, endTime, room, academicYear } = req.body;

    const schedule = await prisma.schedule.update({
      where: { id: req.params.id },
      data: {
        classId,
        subjectId,
        teacherId,
        day,
        startTime,
        endTime,
        room,
        academicYear,
      },
      include: {
        class: true,
        subject: true,
        teacher: { include: { user: true } },
      },
    });

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.schedule.delete({ where: { id: req.params.id } });
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
