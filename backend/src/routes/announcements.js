const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { category, priority, targetAudience } = req.query;
    const where = { isActive: true };
    if (category) where.category = category;
    if (priority) where.priority = priority;
    if (targetAudience) where.targetAudience = targetAudience;

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: [{ publishDate: 'desc' }],
    });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const announcement = await prisma.announcement.findUnique({
      where: { id: req.params.id },
    });

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json(announcement);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { title, content, category, priority, targetAudience, publishDate, expiryDate, isActive } = req.body;

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        category,
        priority,
        targetAudience,
        publishDate: publishDate ? new Date(publishDate) : new Date(),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { title, content, category, priority, targetAudience, publishDate, expiryDate, isActive } = req.body;

    const announcement = await prisma.announcement.update({
      where: { id: req.params.id },
      data: {
        title,
        content,
        category,
        priority,
        targetAudience,
        publishDate: publishDate ? new Date(publishDate) : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive,
      },
    });

    res.json(announcement);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.announcement.delete({ where: { id: req.params.id } });
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
