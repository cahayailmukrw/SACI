const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { educationLevel } = req.query;
    const where = {};
    if (educationLevel) where.educationLevel = educationLevel;

    const teachers = await prisma.teacher.findMany({
      where,
      include: {
        user: true,
        classes: true,
      },
    });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: req.params.id },
      include: {
        user: true,
        classes: { include: { students: true } },
        grades: { include: { student: true, subject: true } },
      },
    });

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { userId, nip, phone, address, subject, educationLevel } = req.body;

    const teacher = await prisma.teacher.create({
      data: {
        userId,
        nip,
        phone,
        address,
        subject,
        educationLevel,
      },
      include: { user: true },
    });

    res.status(201).json(teacher);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { nip, phone, address, subject, educationLevel } = req.body;

    const teacher = await prisma.teacher.update({
      where: { id: req.params.id },
      data: {
        nip,
        phone,
        address,
        subject,
        educationLevel,
      },
      include: { user: true },
    });

    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.teacher.delete({ where: { id: req.params.id } });
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
