import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { connectDB, sequelize } from '../backend/src/config/db';
import authRoutes from '../backend/src/routes/auth';
import roomRoutes from '../backend/src/routes/rooms';
import complaintRoutes from '../backend/src/routes/complaints';
import foodMenuRoutes from '../backend/src/routes/foodMenu';
import billRoutes from '../backend/src/routes/bills';
import { protect } from '../backend/src/middleware/auth';
import { seedData } from '../backend/src/seed';

// Import Models
import Student from '../backend/src/models/Student';
import Room from '../backend/src/models/Room';
import Complaint from '../backend/src/models/Complaint';
import Bill from '../backend/src/models/Bill';
import NotificationModel from '../backend/src/models/Notification'; 

// Establish Associations (Crucial for includes)
Room.hasMany(Student, { foreignKey: 'roomId', as: 'occupants' });
Student.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });
Student.hasMany(Complaint, { foreignKey: 'studentId' });
Complaint.belongsTo(Student, { foreignKey: 'studentId' });
Student.hasMany(Bill, { foreignKey: 'studentId' });
Bill.belongsTo(Student, { foreignKey: 'studentId' });
Student.hasMany(NotificationModel, { foreignKey: 'studentId' });
NotificationModel.belongsTo(Student, { foreignKey: 'studentId' });

// Load environment variables
dotenv.config();

// Type definitions
interface AuthenticatedRequest extends Request {
  user?: { id: number; role: string };
}

interface BookRequestBody {
  roomId: number;
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Performance Middleware (MUST be first)
app.use(helmet());
app.use(compression());
app.use(cors({ 
  origin: true, 
  credentials: true 
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: { message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', limiter);
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Enhanced Request Logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// Database initialization with Promise caching (Serverless safe)
let dbPromise: Promise<void> | null = null;

const initDB = async (): Promise<void> => {
  try {
    await connectDB();
    if (process.env.NODE_ENV !== 'production' || process.env.SYNC_DB === 'true') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database synchronized');
      await seedData(true);
      console.log('✅ Seed data loaded');
    }
  } catch (error) {
    console.error('❌ Database Initialization Error:', error);
    throw error;
  }
};

const ensureDB = async (): Promise<void> => {
  if (!dbPromise) {
    dbPromise = initDB();
  }
  return dbPromise;
};

// DB middleware
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await ensureDB();
    next();
  } catch (error) {
    next(error);
  }
});

// Health check route (before protection)
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      status: 'OK', 
      message: 'Hostel Management API is running',
      timestamp: new Date().toISOString(),
      db: 'Connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Database connection failed',
      db: 'Disconnected'
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/food-menu', foodMenuRoutes);
app.use('/api/bills', billRoutes);

// Enhanced Student Book Request with validation & transaction
app.post('/api/students/book-request', protect as any, async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const t = await sequelize.transaction();
  try {
    const { roomId } = req.body as BookRequestBody;
    
    if (!roomId || roomId <= 0) {
      return res.status(400).json({ message: 'Valid roomId is required' });
    }

    const student = await Student.findByPk(req.user!.id, { 
      transaction: t,
      include: [{ model: Room, as: 'room' }]
    });
    
    if (!student) {
      await t.rollback();
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check room availability
    const room = await Room.findByPk(roomId, { 
      include: [{ model: Student, as: 'occupants' }],
      transaction: t 
    });
    
    if (!room) {
      await t.rollback();
      return res.status(404).json({ message: 'Room not found' });
    }
    
    const occupants = (room as any).occupants || [];
    const capacity = room.get('capacity') as number;

    if (occupants.length >= capacity) {
      await t.rollback();
      return res.status(400).json({ message: 'Room is fully occupied' });
    }

    await student.update({ 
      bookingStatus: 'Pending',
      roomId 
    }, { transaction: t });

    await t.commit();
    
    const updatedStudent = await Student.findByPk(
      req.user!.id, 
      { include: [{ model: Room, as: 'room' }] }
    );
    
    res.json(updatedStudent);
  } catch (error: any) {
    if (!(t as any).finished) await t.rollback();
    console.error('Booking error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all students (Admin only)
app.get('/api/students', protect as any, async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const students = await Student.findAll({ 
      where: { role: 'student' },
      include: [{ model: Room, as: 'room' }]
    });
    
    res.json(students);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Manage Booking Status (Admin) with notification
app.patch('/api/students/:id/booking', protect as any, async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const t = await sequelize.transaction();
  try {
    if (req.user?.role !== 'admin') {
      await t.rollback();
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { status } = req.body;
    const studentId = Number(req.params.id);
    
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      await t.rollback();
      return res.status(400).json({ message: 'Invalid status' });
    }

    const student = await Student.findByPk(studentId, { transaction: t });
    if (!student) {
      await t.rollback();
      return res.status(404).json({ message: 'Student not found' });
    }
    
    await student.update({ bookingStatus: status }, { transaction: t });
    
    // Auto-notify student
    await NotificationModel.create({
      studentId: student.id,
      title: 'Booking Update',
      message: `Your room booking status has been updated to: ${status}`,
      type: status === 'Approved' ? 'success' : 'warning' // 'error' is not in ENUM, using 'warning' for rejected
    }, { transaction: t });

    await t.commit();
    res.json(student);
  } catch (error: any) {
    if (!(t as any).finished) await t.rollback();
    res.status(500).json({ message: error.message });
  }
});

// Internal Notify Route (Admin)
app.post('/api/students/:id/notify', protect as any, async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const studentId = Number(req.params.id);
    const { title, message, type = 'info' } = req.body;
    
    const notif = await NotificationModel.create({
      studentId,
      title,
      message,
      type
    });
    
    res.status(201).json(notif);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Global Error Handler
app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('🚨 Server Error:', error);
  
  const status = error.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : error.message;

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && { 
      stack: error.stack,
      name: error.name 
    })
  });
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Closing server gracefully...`);
  
  sequelize.close().then(() => {
    console.log('✅ Database connection closed');
    process.exit(0);
  }).catch((err) => {
    console.error('❌ Error closing DB:', err);
    process.exit(1);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Local development server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n🌐 Local server running on http://localhost:${PORT}`);
    console.log(`📡 API Base: http://localhost:${PORT}/api`);
    console.log(`✅ Ready for requests!\n`);
  });
}

export default app;
