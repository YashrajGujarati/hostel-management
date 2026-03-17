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

// Ensure models are registered with sequelize
import '../backend/src/models/Student';
import '../backend/src/models/Room';
import '../backend/src/models/Complaint';
import '../backend/src/models/Bill';
import NotificationModel from '../backend/src/models/Notification'; 

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
  origin: true, // Allow all origins in this setup, or restrict to process.env.FRONTEND_URL
  credentials: true 
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
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

    const StudentModel = sequelize.models.Student;
    const student = await StudentModel?.findByPk(req.user!.id, { 
      transaction: t,
      include: [{ model: sequelize.models.Room, as: 'Room' }] // Adjust alias as per associations
    });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check room availability
    const RoomModel = sequelize.models.Room;
    const room = await RoomModel.findByPk(roomId, { 
      include: [{ model: StudentModel, as: 'occupants' }],
      transaction: t 
    });
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    if (room.get('occupants')?.length >= (room.get('capacity') as number)) {
      return res.status(400).json({ message: 'Room is fully occupied' });
    }

    await student.update({ 
      bookingStatus: 'Pending',
      roomId 
    }, { transaction: t });

    await t.commit();
    
    const updatedStudent = await StudentModel?.findByPk(
      req.user!.id, 
      { include: [{ model: sequelize.models.Room, as: 'Room' }] }
    );
    
    res.json(updatedStudent);
  } catch (error: any) {
    await t.rollback();
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
    
    const StudentModel = sequelize.models.Student;
    const students = await StudentModel.findAll({ 
      where: { role: 'student' },
      include: [{ model: sequelize.models.Room, as: 'Room' }]
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
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { status } = req.body;
    const studentId = Number(req.params.id);
    
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const StudentModel = sequelize.models.Student;
    
    const student = await StudentModel.findByPk(studentId, { transaction: t });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    await student.update({ bookingStatus: status }, { transaction: t });
    
    // Auto-notify student
    await NotificationModel.create({
      studentId: student.id,
      title: 'Booking Update',
      message: `Your room booking status has been updated to: ${status}`,
      type: status === 'Approved' ? 'success' : status === 'Rejected' ? 'error' : 'warning'
    }, { transaction: t });

    await t.commit();
    res.json(student);
  } catch (error: any) {
    await t.rollback();
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

// Enhanced Health Check
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
