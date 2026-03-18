import Student from './models/Student';
import Room from './models/Room';
import FoodMenu from './models/FoodMenu';
import Bill from './models/Bill';
import Complaint from './models/Complaint';
import Notification from './models/Notification';

export const seedData = async (isStartup = false) => {
  try {
    if (!isStartup) {
      // Clear existing data if not startup
      await Student.deleteMany({});
      await Room.deleteMany({});
      await FoodMenu.deleteMany({});
      await Bill.deleteMany({});
      await Complaint.deleteMany({});
      await Notification.deleteMany({});
      console.log('🗑️  Database cleared');
    } else {
      console.log('🌱 Checking if database needs seeding...');
    }

    // Check if admin already exists
    const adminExists = await Student.findOne({ role: 'admin' });
    if (adminExists && isStartup) {
      console.log('✅ Database already has data. Skipping seed.');
      return;
    }

    // Create admin
    await Student.create({
      name: 'Hostel Admin',
      email: 'admin@hostelsphere.com',
      password: 'admin123',
      phone: '9999999999',
      role: 'admin'
    });
    console.log('👤 Admin created: admin@hostelsphere.com / admin123');

    // Create demo student
    await Student.create({
      name: 'Banna Student',
      email: 'banna@hostel.com',
      password: 'banna123',
      phone: '9876543210',
      role: 'student'
    });
    console.log('👤 Demo student created: banna@hostel.com / banna123');

    // Create rooms
    const roomsData = [
      { roomNumber: '101', type: 'Single', floor: 1, price: 8000, capacity: 1, amenities: ['WiFi', 'AC', 'Attached Bathroom', 'Study Table', 'Wardrobe'], description: 'Premium single room with all amenities on ground floor' },
      { roomNumber: '102', type: 'Double', floor: 1, price: 6000, capacity: 2, amenities: ['WiFi', 'Fan', 'Common Bathroom', 'Study Table'], description: 'Spacious double sharing room with study area' },
      { roomNumber: '103', type: 'Triple', floor: 1, price: 4500, capacity: 3, amenities: ['WiFi', 'Fan', 'Common Bathroom', 'Wardrobe'], description: 'Affordable triple sharing room' },
      { roomNumber: '104', type: 'Single', floor: 1, price: 8500, capacity: 1, amenities: ['WiFi', 'AC', 'Attached Bathroom', 'Study Table', 'Wardrobe', 'Balcony'], description: 'Premium single room with balcony view' },
      { roomNumber: '201', type: 'Double', floor: 2, price: 6500, capacity: 2, amenities: ['WiFi', 'AC', 'Attached Bathroom', 'Study Table'], description: 'AC double sharing room with attached bath' },
      { roomNumber: '202', type: 'Single', floor: 2, price: 7500, capacity: 1, amenities: ['WiFi', 'AC', 'Common Bathroom', 'Study Table'], description: 'Comfortable single room with AC' },
      { roomNumber: '203', type: 'Triple', floor: 2, price: 4000, capacity: 3, amenities: ['WiFi', 'Fan', 'Common Bathroom'], description: 'Budget friendly triple sharing' },
      { roomNumber: '204', type: 'Double', floor: 2, price: 5500, capacity: 2, amenities: ['WiFi', 'Fan', 'Common Bathroom', 'Study Table', 'Wardrobe'], description: 'Well-furnished double sharing room' },
      { roomNumber: '301', type: 'Single', floor: 3, price: 9000, capacity: 1, amenities: ['WiFi', 'AC', 'Attached Bathroom', 'Study Table', 'Wardrobe', 'Balcony', 'Mini Fridge'], description: 'Luxury single room with all premium amenities' },
      { roomNumber: '302', type: 'Double', floor: 3, price: 7000, capacity: 2, amenities: ['WiFi', 'AC', 'Attached Bathroom', 'Study Table', 'Wardrobe'], description: 'Premium double sharing with AC and attached bath' },
      { roomNumber: '303', type: 'Triple', floor: 3, price: 5000, capacity: 3, amenities: ['WiFi', 'Fan', 'Common Bathroom', 'Study Table'], description: 'Spacious triple sharing on top floor' },
      { roomNumber: '304', type: 'Single', floor: 3, price: 8000, capacity: 1, amenities: ['WiFi', 'AC', 'Attached Bathroom', 'Study Table', 'Wardrobe'], description: 'Comfortable single room on top floor with great view' },
    ];

    await Room.insertMany(roomsData);
    console.log(`🏠 ${roomsData.length} rooms created`);

    // Create weekly food menu
    const foodMenuData = [
      { day: 'Monday', morning: 'Poha, Chai, Banana', afternoon: 'Dal Rice, Roti, Mixed Veg, Salad, Curd', night: 'Paneer Butter Masala, Roti, Rice, Gulab Jamun' },
      { day: 'Tuesday', morning: 'Idli Sambar, Coffee, Fruit', afternoon: 'Rajma Chawal, Roti, Aloo Gobi, Raita', night: 'Chole Bhature, Rice, Salad, Ice Cream' },
      { day: 'Wednesday', morning: 'Paratha, Curd, Pickle, Chai', afternoon: 'Sambar Rice, Roti, Bhindi Fry, Papad', night: 'Malai Kofta, Roti, Jeera Rice, Kheer' },
      { day: 'Thursday', morning: 'Upma, Coconut Chutney, Coffee', afternoon: 'Dal Fry, Rice, Roti, Palak Paneer, Salad', night: 'Egg Curry / Paneer Tikka, Roti, Fried Rice, Rasgulla' },
      { day: 'Friday', morning: 'Bread Omelette / Toast, Juice, Banana', afternoon: 'Chicken Biryani / Veg Biryani, Raita, Salad', night: 'Butter Chicken / Shahi Paneer, Naan, Rice, Sweet' },
      { day: 'Saturday', morning: 'Dosa, Sambar, Chutney, Coffee', afternoon: 'Kadhi Chawal, Roti, Aloo Matar, Pickle', night: 'Pasta, Garlic Bread, Soup, Brownie' },
      { day: 'Sunday', morning: 'Puri Bhaji, Chai, Fruit Salad', afternoon: 'Special Thali - Paneer, Dal, 3 Sabzi, Rice, Roti, Sweet, Papad', night: 'Pizza / Veg Manchurian, Fried Rice, Soup, Ice Cream' }
    ];

    await FoodMenu.insertMany(foodMenuData);
    console.log('🍽️  Weekly food menu created');

    console.log('\n✅ Seed complete!');
  } catch (err) {
    console.error('❌ Seed error:', err);
  }
};
