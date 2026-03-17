import { Router, Response } from 'express';
import Complaint from '../models/Complaint';
import Student from '../models/Student';
import Room from '../models/Room';
import { AuthRequest, protect, adminOnly, generateToken } from '../middleware/auth';

const router = Router();

// POST /api/complaints — Submit complaint (student)
router.post('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, subject, description } = req.body;

    const complaint = await Complaint.create({
      studentId: req.user.id,
      category,
      title: subject,
      description
    });

    res.status(201).json(complaint);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// GET /api/complaints — List complaints (admin: all, student: own)
router.get('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let complaints;
    if (req.user.role === 'admin') {
      complaints = await Complaint.findAll({
        order: [['createdAt', 'DESC']],
        include: [{ model: Student, attributes: ['name', 'email', 'phone'] }]
      });
    } else {
      complaints = await Complaint.findAll({
        where: { studentId: req.user.id },
        order: [['createdAt', 'DESC']]
      });
    }
    res.json(complaints);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// PATCH /api/complaints/:id/resolve — Resolve complaint (admin only)
router.patch('/:id/resolve', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, adminResponse } = req.body;

    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) {
      res.status(404).json({ message: 'Complaint not found' });
      return;
    }

    await complaint.update({
      status: status || 'Resolved',
      comment: adminResponse
    });

    res.json(complaint);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;
