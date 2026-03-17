import { Router, Response } from 'express';
import Student from '../models/Student';
import { AuthRequest, generateToken, protect } from '../middleware/auth';

const router = Router();

// POST /api/auth/signup
router.post('/signup', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await Student.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    const student = await Student.create({ name, email, password, phone });
    const token = generateToken(student._id as unknown as string, student.role);

    res.status(201).json({
      _id: student._id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      role: student.role,
      roomId: student.roomId,
      profilePhoto: student.profilePhoto,
      token
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const token = generateToken(student._id as unknown as string, student.role);

    res.json({
      _id: student._id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      role: student.role,
      roomId: student.roomId,
      profilePhoto: student.profilePhoto,
      token
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findById(req.user._id).select('-password').populate('roomId');
    res.json(student);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// PATCH /api/auth/profile-photo — Update profile photo
router.patch('/profile-photo', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { profilePhoto } = req.body;
    
    const student = await Student.findByIdAndUpdate(
      req.user._id,
      { profilePhoto },
      { new: true }
    ).select('-password');

    res.json(student);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;
