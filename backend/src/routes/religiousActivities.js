const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { activityType, targetAudience } = req.query;
    const where = {};
    if (activityType) where.activityType = activityType;
    if (targetAudience) where.targetAudience = targetAudience;

    const activities = await prisma.religiousActivity.findMany({
      where,
      orderBy: [{ date: 'desc' }],
    });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const activity = await prisma.religiousActivity.findUnique({
      where: { id: req.params.id },
    });

    if (!activity) {
      return res.status(404).json({ error: 'Religious activity not found' });
    }

    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { title, description, activityType, date, location, organizer, isMandatory, targetAudience } = req.body;

    const activity = await prisma.religiousActivity.create({
      data: {
        title,
        description,
        activityType,
        date: new Date(date),
        location,
        organizer,
        isMandatory: isMandatory !== undefined ? isMandatory : false,
        targetAudience,
      },
    });

    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { title, description, activityType, date, location, organizer, isMandatory, targetAudience } = req.body;

    const activity = await prisma.religiousActivity.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        activityType,
        date: date ? new Date(date) : undefined,
        location,
        organizer,
        isMandatory,
        targetAudience,
      },
    });

    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.religiousActivity.delete({ where: { id: req.params.id } });
    res.json({ message: 'Religious activity deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
