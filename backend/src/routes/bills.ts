import { Router, Response } from 'express';
import Bill from '../models/Bill';
import Room from '../models/Room';
import { AuthRequest, protect } from '../middleware/auth';

const router = Router();

const FOOD_CHARGE_PER_MONTH = 3000;
const LAUNDRY_CHARGE_PER_MONTH = 500;

const DURATION_LABELS: Record<number, string> = {
  1: '1 Month',
  2: '2 Months',
  3: '3 Months',
  4: '4 Months',
  6: 'Half Year (6 Months)',
  12: 'Full Year (12 Months)'
};

// POST /api/bills/generate — Calculate & generate bill
router.post('/generate', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { duration } = req.body; // 1, 2, 3, 4, 6, or 12

    if (!req.user.roomId) {
      res.status(400).json({ message: 'No room assigned. Please book a room first.' });
      return;
    }

    const room = await Room.findById(req.user.roomId);
    if (!room) {
      res.status(404).json({ message: 'Room not found' });
      return;
    }

    const roomCharges = room.price * duration;
    const foodCharges = FOOD_CHARGE_PER_MONTH * duration;
    const laundryCharges = LAUNDRY_CHARGE_PER_MONTH * duration;
    const subTotal = roomCharges + foodCharges + laundryCharges;
    const gstAmount = Math.round(subTotal * 0.18);
    const totalAmount = subTotal + gstAmount;

    const bill = await Bill.create({
      studentId: req.user.id,
      amount: totalAmount,
      roomCharges,
      foodCharges,
      laundryCharges,
      gstAmount,
      duration,
      durationLabel: DURATION_LABELS[duration] || `${duration} Months`,
      status: 'Unpaid',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });

    res.status(201).json(bill);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// POST /api/bills/:id/pay — Pay a bill
router.post('/:id/pay', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { paymentMethod } = req.body;

    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      res.status(404).json({ message: 'Bill not found' });
      return;
    }

    if (bill.status === 'Paid') {
      res.status(400).json({ message: 'Bill already paid' });
      return;
    }

    bill.status = 'Paid';
    bill.paidDate = new Date();
    bill.paymentMethod = paymentMethod;
    await bill.save();

    // Populate student details for the receipt
    const populatedBill = await Bill.findById(bill._id).populate('studentId', 'name');
    
    // Create a simplified receipt object
    const receipt = {
      ...populatedBill?.toObject(),
      studentName: (populatedBill?.studentId as any)?.name || 'Student',
      roomNumber: room?.roomNumber,
      roomType: room?.type,
      paidAt: bill.paidDate
    };

    res.json(receipt);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// GET /api/bills — Get bills (student: own, admin: all)
router.get('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let bills;
    if (req.user.role === 'admin') {
      bills = await Bill.find().sort({ createdAt: -1 });
    } else {
      bills = await Bill.find({ studentId: req.user.id }).sort({ createdAt: -1 });
    }
    res.json(bills);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;
