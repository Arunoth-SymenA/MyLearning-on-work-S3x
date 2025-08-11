import database from '../config/database';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  try {
    await database.connect();
    
    const usersCollection = database.getCollection('users');
    const studentsCollection = database.getCollection('students');
    const marksCollection = database.getCollection('marks');

    // Clear existing data
    await usersCollection.deleteMany({});
    await studentsCollection.deleteMany({});
    await marksCollection.deleteMany({});

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await usersCollection.insertOne({
      name: 'Admin User',
      email: 'admin@school.com',
      password: adminPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create teacher users
    const teacherPassword = await bcrypt.hash('teacher123', 10);
    const teacher1 = await usersCollection.insertOne({
      name: 'John Smith',
      email: 'john.smith@school.com',
      password: teacherPassword,
      role: 'teacher',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const teacher2 = await usersCollection.insertOne({
      name: 'Sarah Johnson',
      email: 'sarah.johnson@school.com',
      password: teacherPassword,
      role: 'teacher',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create students
    const students = [
      {
        name: 'Alice Brown',
        email: 'alice.brown@student.com',
        studentId: 'STU001',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bob Wilson',
        email: 'bob.wilson@student.com',
        studentId: 'STU002',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Carol Davis',
        email: 'carol.davis@student.com',
        studentId: 'STU003',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'David Miller',
        email: 'david.miller@student.com',
        studentId: 'STU004',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Emma Garcia',
        email: 'emma.garcia@student.com',
        studentId: 'STU005',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Create student users for authentication
    const studentPassword = await bcrypt.hash('admin123', 10);
    const studentUsers = await Promise.all(
      students.map(student => 
        usersCollection.insertOne({
          name: student.name,
          email: student.email,
          password: studentPassword,
          role: 'student',
          createdAt: new Date(),
          updatedAt: new Date()
        })
      )
    );

    const studentResults = await Promise.all(
      students.map(student => studentsCollection.insertOne(student))
    );

    // Create sample marks
    const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography'];
    const semesters = ['Fall 2023', 'Spring 2024'];
    const academicYears = ['2023-2024'];

    const marks = [];
    for (let i = 0; i < studentResults.length; i++) {
      const studentId = studentResults[i].insertedId;
      const teacherId = i % 2 === 0 ? teacher1.insertedId : teacher2.insertedId;
      
      for (const subject of subjects) {
        for (const semester of semesters) {
          marks.push({
            studentId,
            subject,
            marks: Math.floor(Math.random() * 30) + 70, // 70-100
            maxMarks: 100,
            semester,
            academicYear: academicYears[0],
            teacherId,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
    }

    await marksCollection.insertMany(marks);

    console.log('Database seeded successfully!');
    console.log('\nSample login credentials:');
    console.log('Admin: admin@school.com / admin123');
    console.log('Teacher 1: john.smith@school.com / teacher123');
    console.log('Teacher 2: sarah.johnson@school.com / teacher123');
    console.log('\nStudent emails (for login):');
    students.forEach(student => {
      console.log(`${student.name}: ${student.email}`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await database.disconnect();
  }
};

seedDatabase();
