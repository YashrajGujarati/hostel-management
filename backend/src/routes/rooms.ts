import { Router, Response } from 'express';
import Room from '../models/Room';
import Student from '../models/Student';
import { AuthRequest, protect } from '../middleware/auth';

const router = Router();

router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rooms = await Room.findAll({
      include: [{ model: Student, as: 'occupants', attributes: ['name', 'email'] }]
    });
    // Map id to _id for frontend compatibility
    const mapped = rooms.map(r => {
      const json = r.toJSON();
      json._id = json.id.toString();
      return json;
    });
    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// GET /api/rooms/:id — Get single room details
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const room = await Room.findByPk(req.params.id, {
      include: [{ model: Student, as: 'occupants', attributes: ['name', 'email'] }]
    });
    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }
    const json = room.toJSON();
    json._id = json.id;
    res.json(json);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// POST /api/rooms/:id/book — Book a room (auth required)
router.post('/:id/book', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const room = await Room.findByPk(req.params.id, { include: [Student] });
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
      const oldRoom = await Room.findByPk(req.user.roomId);
      if (oldRoom) {
        // In SQL we just update the Student's roomId. 
        // We'll handle counts separately or use associations.
      }
    }

    await req.user.update({ roomId: room.id });
    
    // Check occupancy
    const occupantsCount = await Student.count({ where: { roomId: room.id } });
    if (occupantsCount >= room.capacity) {
      await room.update({ isAvailable: false });
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
    const json = room.toJSON();
    json._id = json.id;
    res.status(201).json(json);
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
    const room = await Room.findByPk(req.params.id);
    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }
    await room.update(req.body);
    const json = room.toJSON();
    json._id = json.id;
    res.json(json);
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
    const room = await Room.findByPk(req.params.id);
    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }
    
    // Check if room has occupants
    const occupants = await Student.count({ where: { roomId: room.id } });
    if (occupants > 0) {
      res.status(400).json({ message: 'Cannot delete room with occupants' });
      return;
    }

    await room.destroy();
    res.json({ message: 'Room deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;
