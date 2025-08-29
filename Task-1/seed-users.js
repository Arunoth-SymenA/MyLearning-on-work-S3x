const { MongoClient } = require('mongodb');

// MongoDB connection string
const MONGODB_URI = 'mongodb://localhost:27017/student_marks_db';

// Sample users data
const users = [
  // Admin users
  {
    name: 'Super Admin',
    email: 'admin@school.com',
    password: '$2a$10$rQZ8K9L2M1N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'School Principal',
    email: 'principal@school.com',
    password: '$2a$10$rQZ8K9L2M1N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Teacher users
  {
    name: 'John Smith',
    email: 'john.smith@school.com',
    password: '$2a$10$rQZ8K9L2M1N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J',
    role: 'teacher',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@school.com',
    password: '$2a$10$rQZ8K9L2M1N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J',
    role: 'teacher',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Michael Brown',
    email: 'michael.brown@school.com',
    password: '$2a$10$rQZ8K9L2M1N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J',
    role: 'teacher',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Emily Davis',
    email: 'emily.davis@school.com',
    password: '$2a$10$rQZ8K9L2M1N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J',
    role: 'teacher',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'David Wilson',
    email: 'david.wilson@school.com',
    password: '$2a$10$rQZ8K9L2M1N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J',
    role: 'teacher',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Student users
  {
    name: 'Alice Johnson',
    email: 'alice.johnson@student.school.com',
    password: '$2a$10$rQZ8K9L2M1N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J',
    role: 'student',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Bob Smith',
    email: 'bob.smith@student.school.com',
    password: '$2a$10$rQZ8K9L2M1N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J',
    role: 'student',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Carol Davis',
    email: 'carol.davis@student.school.com',
    password: '$2a$10$rQZ8K9L2M1N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J',
    role: 'student',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'David Wilson',
    email: 'david.wilson@student.school.com',
    password: '$2a$10$rQZ8K9L2M1N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J',
    role: 'student',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Eva Brown',
    email: 'eva.brown@student.school.com',
    password: '$2a$10$rQZ8K9L2M1N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J',
    role: 'student',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Frank Miller',
    email: 'frank.miller@student.school.com',
    password: '$2a$10$rQZ8K9L2M1N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J',
    role: 'student',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Grace Taylor',
    email: 'grace.taylor@student.school.com',
    password: '$2a$10$rQZ8K9L2M1N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J',
    role: 'student',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Henry Anderson',
    email: 'henry.anderson@student.school.com',
    password: '$2a$10$rQZ8K9L2M1N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J',
    role: 'student',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Ivy Martinez',
    email: 'ivy.martinez@student.school.com',
    password: '$2a$10$rQZ8K9L2M1N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J',
    role: 'student',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Jack Thompson',
    email: 'jack.thompson@student.school.com',
    password: '$2a$10$rQZ8K9L2M1N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J',
    role: 'student',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Sample students data (for the students collection)
const students = [
  {
    name: 'Alice Johnson',
    email: 'alice.johnson@student.school.com',
    studentId: 'STU001',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Bob Smith',
    email: 'bob.smith@student.school.com',
    studentId: 'STU002',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Carol Davis',
    email: 'carol.davis@student.school.com',
    studentId: 'STU003',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'David Wilson',
    email: 'david.wilson@student.school.com',
    studentId: 'STU004',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Eva Brown',
    email: 'eva.brown@student.school.com',
    studentId: 'STU005',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Frank Miller',
    email: 'frank.miller@student.school.com',
    studentId: 'STU006',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Grace Taylor',
    email: 'grace.taylor@student.school.com',
    studentId: 'STU007',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Henry Anderson',
    email: 'henry.anderson@student.school.com',
    studentId: 'STU008',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Ivy Martinez',
    email: 'ivy.martinez@student.school.com',
    studentId: 'STU009',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Jack Thompson',
    email: 'jack.thompson@student.school.com',
    studentId: 'STU010',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB successfully!');
    
    const db = client.db();
    
    // Clear existing data
    console.log('Clearing existing data...');
    await db.collection('users').deleteMany({});
    await db.collection('students').deleteMany({});
    console.log('Existing data cleared.');
    
    // Insert users
    console.log('Inserting users...');
    const usersResult = await db.collection('users').insertMany(users);
    console.log(`✅ ${usersResult.insertedCount} users inserted successfully!`);
    
    // Insert students
    console.log('Inserting students...');
    const studentsResult = await db.collection('students').insertMany(students);
    console.log(`✅ ${studentsResult.insertedCount} students inserted successfully!`);
    
    // Display summary
    console.log('\n📊 Database Seeding Summary:');
    console.log('=============================');
    console.log(`👑 Admins: ${users.filter(u => u.role === 'admin').length}`);
    console.log(`👨‍🏫 Teachers: ${users.filter(u => u.role === 'teacher').length}`);
    console.log(`👨‍🎓 Students: ${users.filter(u => u.role === 'student').length}`);
    console.log(`📚 Total Users: ${users.length}`);
    console.log(`🎯 Total Students: ${students.length}`);
    
    console.log('\n🔐 Login Credentials:');
    console.log('=====================');
    console.log('All users have the password: password123');
    console.log('\n👑 Admin Users:');
    users.filter(u => u.role === 'admin').forEach(u => console.log(`   ${u.email}`));
    console.log('\n👨‍🏫 Teacher Users:');
    users.filter(u => u.role === 'teacher').forEach(u => console.log(`   ${u.email}`));
    console.log('\n👨‍🎓 Student Users:');
    users.filter(u => u.role === 'student').forEach(u => console.log(`   ${u.email}`));
    
    console.log('\n🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed.');
  }
}

// Run the seeding
seedDatabase();
