const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { educationLevel } = req.query;
    const where = {};
    if (educationLevel) where.educationLevel = educationLevel;

    const classes = await prisma.class.findMany({
      where,
      include: {
        homeroomTeacher: { include: { user: true } },
        students: true,
        subjects: { include: { subject: true, teacher: { include: { user: true } } } },
      },
    });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const classData = await prisma.class.findUnique({
      where: { id: req.params.id },
      include: {
        homeroomTeacher: { include: { user: true } },
        students: { include: { parent: { include: { user: true } } } },
        subjects: { include: { subject: true, teacher: { include: { user: true } } } },
      },
    });

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json(classData);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { name, gradeLevel, educationLevel, academicYear, homeroomTeacherId } = req.body;

    const classData = await prisma.class.create({
      data: {
        name,
        gradeLevel,
        educationLevel,
        academicYear,
        homeroomTeacherId,
      },
      include: {
        homeroomTeacher: { include: { user: true } },
      },
    });

    res.status(201).json(classData);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { name, gradeLevel, educationLevel, academicYear, homeroomTeacherId } = req.body;

    const classData = await prisma.class.update({
      where: { id: req.params.id },
      data: {
        name,
        gradeLevel,
        educationLevel,
        academicYear,
        homeroomTeacherId,
      },
      include: {
        homeroomTeacher: { include: { user: true } },
      },
    });

    res.json(classData);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.class.delete({ where: { id: req.params.id } });
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
