import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import { connectDB } from './config/db.js';

dotenv.config();

const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@paie.com',
    password: 'admin123',
    phone: '+91 98765 43210',
    college: 'SRKR',
    department: 'CSE',
    year: '4th Year',
    role: 'admin',
    userType: 'student'
  },
  {
    name: 'John Student',
    email: 'student@paie.com',
    password: 'student123',
    phone: '+91 98765 43211',
    college: 'SRKR',
    department: 'AIDS',
    year: '2nd Year',
    role: 'student',
    userType: 'student'
  },
  {
    name: 'Sarah Facilitator',
    email: 'facilitator@paie.com',
    password: 'facilitator123',
    phone: '+91 98765 43212',
    college: 'External',
    department: 'CSE',
    year: '3rd Year',
    role: 'facilitator',
    userType: 'corporate',
    organization: 'Tech Corp India'
  },
  {
    name: 'Mike Corporate',
    email: 'corporate@paie.com',
    password: 'corporate123',
    phone: '+91 98765 43213',
    college: 'External',
    department: 'IT',
    year: '1st Year',
    role: 'facilitator',
    userType: 'corporate',
    organization: 'Innovation Labs'
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('🗑️  Clearing existing users...');
    await User.deleteMany({});
    
    console.log('🌱 Seeding sample users...');
    for (const userData of sampleUsers) {
      const user = await User.create(userData);
      console.log(`✅ Created ${user.role}: ${user.email}`);
    }
    
    console.log('\n✨ Database seeded successfully!\n');
    console.log('Sample Credentials:');
    console.log('==================');
    sampleUsers.forEach(user => {
      console.log(`\n${user.role.toUpperCase()} (${user.userType}):`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      if (user.organization) {
        console.log(`  Organization: ${user.organization}`);
      }
    });
    console.log('\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
