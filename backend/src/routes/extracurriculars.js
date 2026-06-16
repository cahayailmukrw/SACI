const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get all extracurriculars with filtering
router.get('/', authenticate, async (req, res) => {
  try {
    const { category, isActive } = req.query;
    
    const where = {};
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const extracurriculars = await prisma.extracurricular.findMany({
      where,
      include: {
        enrollments: {
          include: {
            student: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json(extracurriculars);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single extracurricular by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const extracurricular = await prisma.extracurricular.findUnique({
      where: { id: req.params.id },
      include: {
        enrollments: {
          include: {
            student: true
          }
        }
      }
    });

    if (!extracurricular) {
      return res.status(404).json({ error: 'Extracurricular not found' });
    }

    res.json(extracurricular);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new extracurricular
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      schedule,
      instructor,
      fee,
      maxStudents
    } = req.body;

    const extracurricular = await prisma.extracurricular.create({
      data: {
        name,
        category,
        description,
        schedule,
        instructor,
        fee: fee ? parseFloat(fee) : null,
        maxStudents: maxStudents ? parseInt(maxStudents) : null
      },
      include: {
        enrollments: {
          include: {
            student: true
          }
        }
      }
    });

    res.status(201).json(extracurricular);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update extracurricular
router.put('/:id', authenticate, async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      schedule,
      instructor,
      fee,
      maxStudents,
      isActive
    } = req.body;

    const extracurricular = await prisma.extracurricular.update({
      where: { id: req.params.id },
      data: {
        name,
        category,
        description,
        schedule,
        instructor,
        fee: fee ? parseFloat(fee) : undefined,
        maxStudents: maxStudents ? parseInt(maxStudents) : undefined,
        isActive
      },
      include: {
        enrollments: {
          include: {
            student: true
          }
        }
      }
    });

    res.json(extracurricular);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete extracurricular
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await prisma.extracurricular.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Extracurricular deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Enroll student in extracurricular
router.post('/:id/enroll', authenticate, async (req, res) => {
  try {
    const { studentId } = req.body;

    const enrollment = await prisma.extracurricularEnrollment.create({
      data: {
        studentId,
        extracurricularId: req.params.id
      },
      include: {
        student: true,
        extracurricular: true
      }
    });

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get enrollments for a specific extracurricular
router.get('/:id/enrollments', authenticate, async (req, res) => {
  try {
    const enrollments = await prisma.extracurricularEnrollment.findMany({
      where: {
        extracurricularId: req.params.id
      },
      include: {
        student: {
          include: {
            parent: true
          }
        },
        extracurricular: true
      },
      orderBy: {
        enrollmentDate: 'desc'
      }
    });

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
