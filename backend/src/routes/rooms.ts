import { Router, Response } from 'express';
import Room from '../models/Room';
import Student from '../models/Student';
import { AuthRequest, protect } from '../middleware/auth';

const router = Router();

// GET /api/rooms — List all rooms
router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rooms = await Room.find().populate('occupants', 'name email');
    res.json(rooms);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// GET /api/rooms/:id — Get single room details
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const room = await Room.findById(req.params.id).populate('occupants', 'name email');
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

    if (req.user.roomId) {
      // Remove from old room
      await Room.findByIdAndUpdate(req.user.roomId, {
        $pull: { occupants: req.user._id }
      });
      const oldRoom = await Room.findById(req.user.roomId);
      if (oldRoom && oldRoom.occupants.length < oldRoom.capacity) {
        oldRoom.isAvailable = true;
        await oldRoom.save();
      }
    }

    room.occupants.push(req.user._id);
    if (room.occupants.length >= room.capacity) {
      room.isAvailable = false;
    }
    await room.save();

    await Student.findByIdAndUpdate(req.user._id, { roomId: room._id });

    res.json({ message: 'Room booked successfully', room });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;
