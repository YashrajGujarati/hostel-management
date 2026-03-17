import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import authRoutes from './routes/auth';
import roomRoutes from './routes/rooms';
import complaintRoutes from './routes/complaints';
import foodMenuRoutes from './routes/foodMenu';
import billRoutes from './routes/bills';
import Student from './models/Student';
import { protect } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/food-menu', foodMenuRoutes);
app.use('/api/bills', billRoutes);

// Student Book Request
app.post('/api/students/book-request', protect, async (req: any, res) => {
  try {
    const { roomType, roomId } = req.body;
    const student = await Student.findByIdAndUpdate(req.user._id, { 
      bookingStatus: 'Pending',
      roomId: roomId // temporary or preferred room
    }, { new: true });
    res.json(student);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Advanced Features: All Students for Admin

// Get all students
app.get('/api/students', protect, async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const students = await Student.find({ role: 'student' }).populate('roomId');
    res.json(students);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Manage Booking Status
app.patch('/api/students/:id/booking', protect, async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { status } = req.body;
    const student = await Student.findByIdAndUpdate(req.params.id, { bookingStatus: status }, { new: true });
    
    // Auto-notify student
    const notif = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Booking Update',
      message: `Your room booking status has been updated to: ${status}`,
      type: status === 'Approved' ? 'success' : 'warning',
      createdAt: new Date()
    };
    await Student.findByIdAndUpdate(req.params.id, { $push: { notifications: notif } });

    res.json(student);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Internal Notify Route
app.post('/api/students/:id/notify', protect, async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { title, message, type } = req.body;
    const notif = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      type: type || 'info',
      createdAt: new Date()
    };
    const student = await Student.findByIdAndUpdate(req.params.id, { $push: { notifications: notif } }, { new: true });
    res.json(student);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Hostel Management API is running' });
});

app.listen(PORT, () => {
  console.log('');
  console.log('🏨 Hostel Management System API');
  console.log(`🌐 Server running on http://localhost:${PORT}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api`);
  console.log('');
});
export default app;
