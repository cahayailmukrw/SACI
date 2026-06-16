const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get all student affairs with filtering
router.get('/', authenticate, async (req, res) => {
  try {
    const { studentId, type, category, severity, resolved } = req.query;
    
    const where = {};
    if (studentId) where.studentId = studentId;
    if (type) where.type = type;
    if (category) where.category = category;
    if (severity) where.severity = severity;
    if (resolved !== undefined) where.resolved = resolved === 'true';

    const studentAffairs = await prisma.studentAffair.findMany({
      where,
      include: {
        student: {
          include: {
            parent: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    res.json(studentAffairs);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single student affair by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const studentAffair = await prisma.studentAffair.findUnique({
      where: { id: req.params.id },
      include: {
        student: {
          include: {
            parent: true
          }
        }
      }
    });

    if (!studentAffair) {
      return res.status(404).json({ error: 'Student affair not found' });
    }

    res.json(studentAffair);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new student affair
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      studentId,
      type,
      category,
      title,
      description,
      severity,
      points,
      actionTaken
    } = req.body;

    const studentAffair = await prisma.studentAffair.create({
      data: {
        studentId,
        type,
        category,
        title,
        description,
        severity,
        points: points ? parseInt(points) : null,
        actionTaken
      },
      include: {
        student: {
          include: {
            parent: true
          }
        }
      }
    });

    res.status(201).json(studentAffair);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update student affair
router.put('/:id', authenticate, async (req, res) => {
  try {
    const {
      type,
      category,
      title,
      description,
      severity,
      points,
      actionTaken,
      resolved,
      resolvedBy
    } = req.body;

    const studentAffair = await prisma.studentAffair.update({
      where: { id: req.params.id },
      data: {
        type,
        category,
        title,
        description,
        severity,
        points: points ? parseInt(points) : undefined,
        actionTaken,
        resolved,
        resolvedAt: resolved === true ? new Date() : undefined,
        resolvedBy
      },
      include: {
        student: {
          include: {
            parent: true
          }
        }
      }
    });

    res.json(studentAffair);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete student affair
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await prisma.studentAffair.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Student affair deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resolve student affair
router.patch('/:id/resolve', authenticate, async (req, res) => {
  try {
    const { resolvedBy } = req.body;

    const studentAffair = await prisma.studentAffair.update({
      where: { id: req.params.id },
      data: {
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy
      },
      include: {
        student: {
          include: {
            parent: true
          }
        }
      }
    });

    res.json(studentAffair);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
