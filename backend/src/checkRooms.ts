import mongoose from 'mongoose';
import Room from './models/Room';
import { connectDB } from './config/db';

const checkRooms = async () => {
  await connectDB();
  const rooms = await Room.find();
  console.log('Total Rooms:', rooms.length);
  console.log('Rooms:', JSON.stringify(rooms, null, 2));
  process.exit(0);
};

checkRooms();
