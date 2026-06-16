const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { educationLevel } = req.query;
    const where = {};
    if (educationLevel) where.educationLevel = educationLevel;

    const subjects = await prisma.subject.findMany({
      where,
      include: {
        subjectClasses: { include: { class: true, teacher: { include: { user: true } } } },
      },
    });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: req.params.id },
      include: {
        subjectClasses: { include: { class: true, teacher: { include: { user: true } } } },
        grades: { include: { student: true, teacher: { include: { user: true } } } },
      },
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { name, code, category, educationLevel, description, credits } = req.body;

    console.log('Creating subject with data:', { name, code, category, educationLevel, description, credits });

    const subject = await prisma.subject.create({
      data: {
        name,
        code,
        category: category.toUpperCase(),
        educationLevel,
        description,
        credits,
      },
    });

    res.status(201).json(subject);
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.put('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { name, code, category, educationLevel, description, credits } = req.body;

    const subject = await prisma.subject.update({
      where: { id: req.params.id },
      data: {
        name,
        code,
        category: category ? category.toUpperCase() : undefined,
        educationLevel,
        description,
        credits,
      },
    });

    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.subject.delete({ where: { id: req.params.id } });
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
