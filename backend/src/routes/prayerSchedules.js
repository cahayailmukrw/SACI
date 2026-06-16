const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const prayerSchedules = await prisma.prayerSchedule.findMany({
      where: { isActive: true },
      orderBy: [
        { prayerName: 'asc' },
      ],
    });
    res.json(prayerSchedules);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const prayerSchedule = await prisma.prayerSchedule.findUnique({
      where: { id: req.params.id },
    });

    if (!prayerSchedule) {
      return res.status(404).json({ error: 'Prayer schedule not found' });
    }

    res.json(prayerSchedule);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { prayerName, startTime, endTime, location, notes, isActive } = req.body;

    const prayerSchedule = await prisma.prayerSchedule.create({
      data: {
        prayerName,
        startTime,
        endTime,
        location,
        notes,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.status(201).json(prayerSchedule);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { prayerName, startTime, endTime, location, notes, isActive } = req.body;

    const prayerSchedule = await prisma.prayerSchedule.update({
      where: { id: req.params.id },
      data: {
        prayerName,
        startTime,
        endTime,
        location,
        notes,
        isActive,
      },
    });

    res.json(prayerSchedule);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.prayerSchedule.delete({ where: { id: req.params.id } });
    res.json({ message: 'Prayer schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
