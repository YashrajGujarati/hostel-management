import express from 'express';
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
import sequelize from './config/db';
import { seedData } from './seed';

// Establish Associations
Room.hasMany(Student, { foreignKey: 'roomId', as: 'occupants' });
Student.belongsTo(Room, { foreignKey: 'roomId' });
Student.hasMany(Complaint, { foreignKey: 'studentId' });
Complaint.belongsTo(Student, { foreignKey: 'studentId' });
Student.hasMany(Bill, { foreignKey: 'studentId' });
Bill.belongsTo(Student, { foreignKey: 'studentId' });
 Student.hasMany(Notification, { foreignKey: 'studentId' });
Notification.belongsTo(Student, { foreignKey: 'studentId' });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Connect to MySQL and Sync
connectDB().then(() => {
  sequelize.sync({ alter: true }).then(async () => {
    console.log('✅ Database synchronized');
    await seedData(true);
  });
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
    const { roomType, roomId } = req.body;
    const student = await Student.findByPk(req.user.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    await student.update({ 
      bookingStatus: 'Pending',
      roomId: roomId // temporary or preferred room
    });
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
    const students = await Student.findAll({ 
      where: { role: 'student' },
      include: [Room]
    });
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
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    await student.update({ bookingStatus: status });
    
    // Auto-notify student (In SQL we use the Notification model)
    const { default: Notification } = await import('./models/Notification');
    await Notification.create({
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

// Internal Notify Route
app.post('/api/students/:id/notify', protect, async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { title, message, type } = req.body;
    
    const { default: Notification } = await import('./models/Notification');
    const notif = await Notification.create({
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

app.listen(PORT, () => {
  console.log('');
  console.log('🏨 Hostel Management System API');
  console.log(`🌐 Server running on http://localhost:${PORT}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api`);
  console.log('');
});
export default app;
