import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { connectDB } from './config/db';
import authRoutes from './routes/auth';
import roomRoutes from './routes/rooms';
import complaintRoutes from './routes/complaints';
import foodMenuRoutes from './routes/foodMenu';
import billRoutes from './routes/bills';
import Student from './models/Student';
import Room from './models/Room';
import Complaint from './models/Complaint';
import Bill from './models/Bill';
import Notification from './models/Notification';
import { protect } from './middleware/auth';
import { seedData } from './seed';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Database Health Check Middleware
app.use((req, res, next) => {
  // Skip health check for the health route itself
  if (req.path === '/api/health') return next();
  
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ 
      message: 'Database is currently offline. This is usually because your IP address is not whitelisted in MongoDB Atlas. Go to Network Access -> Add 0.0.0.0/0.' 
    });
    return;
  }
  next();
});

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Database initialization
connectDB().then(async () => {
  if (process.env.SYNC_DB === 'true') {
     await seedData(true);
  }
}).catch(err => {
  console.error('Database connection failed', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/food-menu', foodMenuRoutes);
app.use('/api/bills', billRoutes);

// Student Book Request
app.post('/api/students/book-request', protect, async (req: any, res) => {
  try {
    const { roomId } = req.body;
    const student = await Student.findById(req.user.id);
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }
    
    student.bookingStatus = 'Pending';
    student.roomId = roomId; // temporary or preferred room
    await student.save();
    
    res.json(student);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Advanced Features: All Students for Admin

// Get all students
app.get('/api/students', protect, async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    const students = await Student.find({ role: 'student' }).populate('roomId');
    res.json(students);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Manage Booking Status
app.patch('/api/students/:id/booking', protect, async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    const { status } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }
    
    student.bookingStatus = status;
    await student.save();
    
    // Auto-notify student
    await Notification.create({
      studentId: student._id,
      title: 'Booking Update',
      message: `Your room booking status has been updated to: ${status}`,
      type: status === 'Approved' ? 'success' : 'warning'
    });

    res.json(student);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Internal Notify Route
app.post('/api/students/:id/notify', protect, async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    const { title, message, type } = req.body;
    
    const notif = await Notification.create({
      studentId: req.params.id,
      title,
      message,
      type: type || 'info'
    });
    
    res.json(notif);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Hostel Management API is running' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log('');
    console.log('🏨 Hostel Management System API');
    console.log(`🌐 Server running on http://localhost:${PORT}`);
    console.log(`📡 API Base: http://localhost:${PORT}/api`);
    console.log('');
  });
}
export default app;
