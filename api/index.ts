import express from 'express';
import cors from 'cors';
import { connectDB } from '../backend/src/config/db';
import authRoutes from '../backend/src/routes/auth';
import roomRoutes from '../backend/src/routes/rooms';
import complaintRoutes from '../backend/src/routes/complaints';
import foodMenuRoutes from '../backend/src/routes/foodMenu';
import billRoutes from '../backend/src/routes/bills';
import Student from '../backend/src/models/Student';
import Room from '../backend/src/models/Room';
import Complaint from '../backend/src/models/Complaint';
import Bill from '../backend/src/models/Bill';
import NotificationModel from '../backend/src/models/Notification'; // Renamed to avoid collision with global Notification
import { protect } from '../backend/src/middleware/auth';
import sequelize from '../backend/src/config/db';
import { seedData } from '../backend/src/seed';

// Establish Associations
Room.hasMany(Student, { foreignKey: 'roomId', as: 'occupants' });
Student.belongsTo(Room, { foreignKey: 'roomId' });
Student.hasMany(Complaint, { foreignKey: 'studentId' });
Complaint.belongsTo(Student, { foreignKey: 'studentId' });
Student.hasMany(Bill, { foreignKey: 'studentId' });
Bill.belongsTo(Student, { foreignKey: 'studentId' });
Student.hasMany(NotificationModel, { foreignKey: 'studentId' });
NotificationModel.belongsTo(Student, { foreignKey: 'studentId' });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Request Logger
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Database initialization helper
const initDB = async () => {
  try {
    await connectDB();
    if (process.env.NODE_ENV !== 'production' || process.env.SYNC_DB === 'true') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database synchronized');
      await seedData(true);
    }
  } catch (error) {
    console.error('❌ Database Initialization Error:', error);
  }
};

// Lazy initialization of database (Vercel serverless optimization)
let isDBConnected = false;
app.use(async (_req, _res, next) => {
  if (!isDBConnected) {
    await initDB();
    isDBConnected = true;
  }
  next();
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
    const student = await Student.findByPk(req.user.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    await student.update({ 
      bookingStatus: 'Pending',
      roomId: roomId 
    });
    res.json(student);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get all students (Admin)
app.get('/api/students', protect, async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const students = await Student.findAll({ 
      where: { role: 'student' },
      include: [Room]
    });
    res.json(students);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Manage Booking Status (Admin)
app.patch('/api/students/:id/booking', protect, async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { status } = req.body;
    const student = await Student.findByPk(Number(req.params.id));
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    await student.update({ bookingStatus: status });
    
    // Auto-notify student
    await NotificationModel.create({
      studentId: student.id,
      title: 'Booking Update',
      message: `Your room booking status has been updated to: ${status}`,
      type: status === 'Approved' ? 'success' : 'warning'
    });

    res.json(student);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Internal Notify Route (Admin)
app.post('/api/students/:id/notify', protect, async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { title, message, type } = req.body;
    
    const notif = await NotificationModel.create({
      studentId: Number(req.params.id),
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

// Local development server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n🌐 Local server running on http://localhost:${PORT}`);
    console.log(`📡 API Base: http://localhost:${PORT}/api\n`);
  });
}

export default app;
