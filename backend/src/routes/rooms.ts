import { Router, Response } from 'express';
import Room from '../models/Room';
import Student from '../models/Student';
import { AuthRequest, protect } from '../middleware/auth';

const router = Router();

router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rooms = await Room.find();
    // In Mongoose, we don't need manual mapping for _id unless we want to hide it
    res.json(rooms);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// GET /api/rooms/:id — Get single room details
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }
    res.json(room);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// POST /api/rooms/:id/book — Book a room (auth required)
router.post('/:id/book', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    if (!room.isAvailable) {
      res.status(400).json({ message: 'Room is not available' });
      return;
    }

    const student = await Student.findById(req.user.id);
    if (!student) {
        res.status(404).json({ message: 'Student not found' });
        return;
    }

    student.roomId = room._id as any;
    await student.save();
    
    // Check occupancy (Mongoose doesn't have auto-increment association counts, usually we'd count)
    const occupantsCount = await Student.countDocuments({ roomId: room._id });
    if (occupantsCount >= room.capacity) {
      room.isAvailable = false;
      await room.save();
    }

    res.json({ message: 'Room booked successfully', room });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// POST /api/rooms — Create a room (Admin only)
router.post('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user.role !== 'admin') {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    const { roomNumber, type, capacity, price, description, floor } = req.body;
    const room = await Room.create({
      roomNumber,
      type,
      capacity,
      price,
      description,
      floor,
      isAvailable: true
    });
    res.status(201).json(room);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// PATCH /api/rooms/:id — Update a room (Admin only)
router.patch('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user.role !== 'admin') {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }
    res.json(room);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// DELETE /api/rooms/:id — Delete a room (Admin only)
router.delete('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user.role !== 'admin') {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    
    const room = await Room.findById(req.params.id);
    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }
    
    // Check if room has occupants
    const occupants = await Student.countDocuments({ roomId: room._id });
    if (occupants > 0) {
      res.status(400).json({ message: 'Cannot delete room with occupants' });
      return;
    }

    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;
