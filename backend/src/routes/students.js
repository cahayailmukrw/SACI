const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { educationLevel } = req.query;
    const where = educationLevel ? { educationLevel } : {};

    const students = await prisma.student.findMany({
      where,
      include: {
        parent: { include: { user: true } },
        class: true,
      },
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        parent: { include: { user: true } },
        class: true,
        grades: { include: { subject: true, teacher: { include: { user: true } } } },
        attendance: true,
        tahfidz: true,
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { nis, nisn, name, gender, birthDate, birthPlace, address, phone, parentId, classId, educationLevel } = req.body;

    const student = await prisma.student.create({
      data: {
        nis,
        nisn,
        name,
        gender,
        birthDate: new Date(birthDate),
        birthPlace,
        address,
        phone,
        parentId,
        classId,
        educationLevel,
      },
      include: {
        parent: { include: { user: true } },
        class: true,
      },
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { name, gender, birthDate, birthPlace, address, phone, classId, educationLevel } = req.body;

    const student = await prisma.student.update({
      where: { id: req.params.id },
      data: {
        name,
        gender,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        birthPlace,
        address,
        phone,
        classId,
        educationLevel,
      },
      include: {
        parent: { include: { user: true } },
        class: true,
      },
    });

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.student.delete({ where: { id: req.params.id } });
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
