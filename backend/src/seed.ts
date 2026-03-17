import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db';
import Student from './models/Student';
import Room from './models/Room';
import FoodMenu from './models/FoodMenu';

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await Student.deleteMany({});
  await Room.deleteMany({});
  await FoodMenu.deleteMany({});

  console.log('🗑️  Cleared existing data');

  // Create admin
  const admin = await Student.create({
    name: 'Hostel Admin',
    email: 'admin@hostel.com',
    password: 'admin123',
    phone: '9999999999',
    role: 'admin'
  });
  console.log('👤 Admin created: admin@hostel.com / admin123');

  // Create demo student
  await Student.create({
    name: 'Rahul Kumar',
    email: 'rahul@student.com',
    password: 'student123',
    phone: '9876543210',
    role: 'student'
  });
  console.log('👤 Demo student created: rahul@student.com / student123');

  // Create rooms
  const rooms = [
    // Floor 1
    { roomNumber: '101', type: 'Single', floor: 1, price: 8000, capacity: 1, amenities: ['WiFi', 'AC', 'Attached Bathroom', 'Study Table', 'Wardrobe'], description: 'Premium single room with all amenities on ground floor' },
    { roomNumber: '102', type: 'Double', floor: 1, price: 6000, capacity: 2, amenities: ['WiFi', 'Fan', 'Common Bathroom', 'Study Table'], description: 'Spacious double sharing room with study area' },
    { roomNumber: '103', type: 'Triple', floor: 1, price: 4500, capacity: 3, amenities: ['WiFi', 'Fan', 'Common Bathroom', 'Wardrobe'], description: 'Affordable triple sharing room' },
    { roomNumber: '104', type: 'Single', floor: 1, price: 8500, capacity: 1, amenities: ['WiFi', 'AC', 'Attached Bathroom', 'Study Table', 'Wardrobe', 'Balcony'], description: 'Premium single room with balcony view' },
    // Floor 2
    { roomNumber: '201', type: 'Double', floor: 2, price: 6500, capacity: 2, amenities: ['WiFi', 'AC', 'Attached Bathroom', 'Study Table'], description: 'AC double sharing room with attached bath' },
    { roomNumber: '202', type: 'Single', floor: 2, price: 7500, capacity: 1, amenities: ['WiFi', 'AC', 'Common Bathroom', 'Study Table'], description: 'Comfortable single room with AC' },
    { roomNumber: '203', type: 'Triple', floor: 2, price: 4000, capacity: 3, amenities: ['WiFi', 'Fan', 'Common Bathroom'], description: 'Budget friendly triple sharing' },
    { roomNumber: '204', type: 'Double', floor: 2, price: 5500, capacity: 2, amenities: ['WiFi', 'Fan', 'Common Bathroom', 'Study Table', 'Wardrobe'], description: 'Well-furnished double sharing room' },
    // Floor 3
    { roomNumber: '301', type: 'Single', floor: 3, price: 9000, capacity: 1, amenities: ['WiFi', 'AC', 'Attached Bathroom', 'Study Table', 'Wardrobe', 'Balcony', 'Mini Fridge'], description: 'Luxury single room with all premium amenities' },
    { roomNumber: '302', type: 'Double', floor: 3, price: 7000, capacity: 2, amenities: ['WiFi', 'AC', 'Attached Bathroom', 'Study Table', 'Wardrobe'], description: 'Premium double sharing with AC and attached bath' },
    { roomNumber: '303', type: 'Triple', floor: 3, price: 5000, capacity: 3, amenities: ['WiFi', 'Fan', 'Common Bathroom', 'Study Table'], description: 'Spacious triple sharing on top floor' },
    { roomNumber: '304', type: 'Single', floor: 3, price: 8000, capacity: 1, amenities: ['WiFi', 'AC', 'Attached Bathroom', 'Study Table', 'Wardrobe'], description: 'Comfortable single room on top floor with great view' },
  ];

  await Room.insertMany(rooms);
  console.log(`🏠 ${rooms.length} rooms created`);

  // Create weekly food menu
  const foodMenu = [
    {
      day: 'Monday',
      meals: {
        morning: 'Poha, Chai, Banana',
        afternoon: 'Dal Rice, Roti, Mixed Veg, Salad, Curd',
        night: 'Paneer Butter Masala, Roti, Rice, Gulab Jamun'
      }
    },
    {
      day: 'Tuesday',
      meals: {
        morning: 'Idli Sambar, Coffee, Fruit',
        afternoon: 'Rajma Chawal, Roti, Aloo Gobi, Raita',
        night: 'Chole Bhature, Rice, Salad, Ice Cream'
      }
    },
    {
      day: 'Wednesday',
      meals: {
        morning: 'Paratha, Curd, Pickle, Chai',
        afternoon: 'Sambar Rice, Roti, Bhindi Fry, Papad',
        night: 'Malai Kofta, Roti, Jeera Rice, Kheer'
      }
    },
    {
      day: 'Thursday',
      meals: {
        morning: 'Upma, Coconut Chutney, Coffee',
        afternoon: 'Dal Fry, Rice, Roti, Palak Paneer, Salad',
        night: 'Egg Curry / Paneer Tikka, Roti, Fried Rice, Rasgulla'
      }
    },
    {
      day: 'Friday',
      meals: {
        morning: 'Bread Omelette / Toast, Juice, Banana',
        afternoon: 'Chicken Biryani / Veg Biryani, Raita, Salad',
        night: 'Butter Chicken / Shahi Paneer, Naan, Rice, Sweet'
      }
    },
    {
      day: 'Saturday',
      meals: {
        morning: 'Dosa, Sambar, Chutney, Coffee',
        afternoon: 'Kadhi Chawal, Roti, Aloo Matar, Pickle',
        night: 'Pasta, Garlic Bread, Soup, Brownie'
      }
    },
    {
      day: 'Sunday',
      meals: {
        morning: 'Puri Bhaji, Chai, Fruit Salad',
        afternoon: 'Special Thali - Paneer, Dal, 3 Sabzi, Rice, Roti, Sweet, Papad',
        night: 'Pizza / Veg Manchurian, Fried Rice, Soup, Ice Cream'
      }
    }
  ];

  await FoodMenu.insertMany(foodMenu);
  console.log('🍽️  Weekly food menu created');

  console.log('\n✅ Seed complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin Login:   admin@hostel.com / admin123');
  console.log('Student Login: rahul@student.com / student123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  process.exit(0);
};

seedData().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
