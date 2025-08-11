import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import XLSX from 'xlsx';
import database from '../config/database';
import { User, Student, Mark } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const resolvers = {
  Query: {
    // Auth queries
    me: async (_: any, __: any, { user }: { user: any }) => {
      if (!user) throw new Error('Not authenticated');
      return user;
    },

    // User queries
    users: async () => {
      const usersCollection = database.getCollection('users');
      return await usersCollection.find({}).toArray();
    },

    user: async (_: any, { id }: { id: string }) => {
      const usersCollection = database.getCollection('users');
      return await usersCollection.findOne({ _id: new ObjectId(id) });
    },

    // Student queries
    students: async () => {
      const studentsCollection = database.getCollection('students');
      return await studentsCollection.find({}).toArray();
    },

    student: async (_: any, { id }: { id: string }) => {
      const studentsCollection = database.getCollection('students');
      return await studentsCollection.findOne({ _id: new ObjectId(id) });
    },

    studentByEmail: async (_: any, { email }: { email: string }) => {
      const studentsCollection = database.getCollection('students');
      return await studentsCollection.findOne({ email });
    },

    // Teacher queries
    teachers: async () => {
      const usersCollection = database.getCollection('users');
      return await usersCollection.find({ role: 'teacher' }).toArray();
    },

    teacher: async (_: any, { id }: { id: string }) => {
      const usersCollection = database.getCollection('users');
      return await usersCollection.findOne({ _id: new ObjectId(id), role: 'teacher' });
    },

    // Mark queries
    marks: async () => {
      const marksCollection = database.getCollection('marks');
      return await marksCollection.find({}).toArray();
    },

    mark: async (_: any, { id }: { id: string }) => {
      const marksCollection = database.getCollection('marks');
      return await marksCollection.findOne({ _id: new ObjectId(id) });
    },

    marksByStudent: async (_: any, { studentId }: { studentId: string }) => {
      const marksCollection = database.getCollection('marks');
      return await marksCollection.find({ studentId }).toArray();
    },

    // Dashboard queries
    dashboardStats: async () => {
      const studentsCollection = database.getCollection('students');
      const usersCollection = database.getCollection('users');
      const marksCollection = database.getCollection('marks');

      const totalStudents = await studentsCollection.countDocuments();
      const totalTeachers = await usersCollection.countDocuments({ role: 'teacher' });
      const totalMarks = await marksCollection.countDocuments();

      const marks = await marksCollection.find({}).toArray();
      const averageMarks = marks.length > 0 
        ? marks.reduce((sum, mark) => sum + (mark.marks / mark.maxMarks), 0) / marks.length * 100
        : 0;

      return {
        totalStudents,
        totalTeachers,
        totalMarks,
        averageMarks: Math.round(averageMarks * 100) / 100
      };
    },

    // Download queries
    downloadMarksExcel: async (_: any, __: any, { user }: { user: any }) => {
      if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
        throw new Error('Unauthorized');
      }

      const marksCollection = database.getCollection('marks');
      const studentsCollection = database.getCollection('students');

      const marks = await marksCollection.find({}).toArray();
      const students = await studentsCollection.find({}).toArray();

      const marksData = marks.map((mark) => {
        const student = students.find(s => s._id?.toString() === mark.studentId);
        return {
          Student: student?.name || 'Unknown',
          Subject: mark.subject,
          Marks: mark.marks,
          MaxMarks: mark.maxMarks,
          Percentage: ((mark.marks / mark.maxMarks) * 100).toFixed(2) + '%',
          Semester: mark.semester,
          AcademicYear: mark.academicYear,
          DateAdded: mark.createdAt?.toLocaleDateString() || 'Unknown'
        };
      });

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(marksData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Marks');
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      return Buffer.from(buffer).toString('base64');
    },

    downloadStudentMarksExcel: async (_: any, { studentId }: { studentId: string }, { user }: { user: any }) => {
      if (!user) throw new Error('Not authenticated');

      const marksCollection = database.getCollection('marks');
      const studentsCollection = database.getCollection('students');

      // If student, only allow access to their own marks
      if (user.role === 'student') {
        const student = await studentsCollection.findOne({ email: user.email });
        if (!student || student._id?.toString() !== studentId) {
          throw new Error('Access denied');
        }
      }

      const student = await studentsCollection.findOne({ _id: new ObjectId(studentId) });
      if (!student) throw new Error('Student not found');

      const marks = await marksCollection.find({ studentId }).toArray();
      
      const marksData = marks.map((mark) => ({
        Subject: mark.subject,
        Marks: mark.marks,
        MaxMarks: mark.maxMarks,
        Percentage: ((mark.marks / mark.maxMarks) * 100).toFixed(2) + '%',
        Semester: mark.semester,
        AcademicYear: mark.academicYear,
        DateAdded: mark.createdAt?.toLocaleDateString() || 'Unknown'
      }));

      // Add summary row
      if (marks.length > 0) {
        const summaryRow = {
          Subject: 'TOTAL',
          Marks: marks.reduce((sum, mark) => sum + mark.marks, 0),
          MaxMarks: marks.reduce((sum, mark) => sum + mark.maxMarks, 0),
          Percentage: ((marks.reduce((sum, mark) => sum + mark.marks, 0) / marks.reduce((sum, mark) => sum + mark.maxMarks, 0)) * 100).toFixed(2) + '%',
          Semester: '',
          AcademicYear: '',
          DateAdded: ''
        };
        marksData.push(summaryRow);
      }

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(marksData);
      XLSX.utils.book_append_sheet(workbook, worksheet, `${student.name} Marks`);
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      return Buffer.from(buffer).toString('base64');
    }
  },

  Mutation: {
    // Auth mutations
    login: async (_: any, { input }: { input: { email: string; password: string } }) => {
      const { email, password } = input;
      const usersCollection = database.getCollection('users');

      const user = await usersCollection.findOne({ email });
      if (!user) throw new Error('Invalid credentials');

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) throw new Error('Invalid credentials');

      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };
    },

    register: async (_: any, { input }: { input: { name: string; email: string; password: string; role: string } }) => {
      const { name, email, password, role } = input;
      const usersCollection = database.getCollection('users');

      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) throw new Error('User already exists');

      const hashedPassword = await bcrypt.hash(password, 12);
      const now = new Date();

      const user = {
        name,
        email,
        password: hashedPassword,
        role,
        createdAt: now,
        updatedAt: now
      };

      const result = await usersCollection.insertOne(user);
      const newUser = { ...user, _id: result.insertedId };

      const token = jwt.sign(
        { userId: newUser._id, email: newUser.email, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return {
        token,
        user: newUser
      };
    },

    // Student mutations
    createStudent: async (_: any, { input }: { input: { name: string; email: string; studentId: string } }) => {
      const { name, email, studentId } = input;
      const studentsCollection = database.getCollection('students');
      const usersCollection = database.getCollection('users');

      const existingStudent = await studentsCollection.findOne({ email });
      if (existingStudent) throw new Error('Student already exists');

      const now = new Date();

      const student = {
        name,
        email,
        studentId,
        createdAt: now,
        updatedAt: now
      };

      const user = {
        name,
        email,
        password: await bcrypt.hash('admin123', 12),
        role: 'student',
        createdAt: now,
        updatedAt: now
      };

      await studentsCollection.insertOne(student);
      await usersCollection.insertOne(user);

      return student;
    },
    updateStudent: async (_: any, { id, input }: { id: string; input: { name?: string; email?: string; studentId?: string } }) => {
      const studentsCollection = database.getCollection('students');
      const updateData: any = { ...input, updatedAt: new Date() };
      const result = await studentsCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      if (!result || !result.value) throw new Error('Student not found');
      return { _id: id, ...result.value } as any;
    },
    deleteStudent: async (_: any, { id }: { id: string }) => {
      const studentsCollection = database.getCollection('students');
      const usersCollection = database.getCollection('users');
      const student = await studentsCollection.findOne({ _id: new ObjectId(id) });
      if (!student) return false;
      await studentsCollection.deleteOne({ _id: new ObjectId(id) });
      await usersCollection.deleteOne({ email: (student as any).email });
      return true;
    },

    // Mark mutations
    addMark: async (_: any, { input }: { input: { studentId: string; subject: string; marks: number; maxMarks: number; semester: string; academicYear: string } }, { user }: { user: any }) => {
      if (!user || user.role !== 'teacher') {
        throw new Error('Unauthorized');
      }

      const { studentId, subject, marks, maxMarks, semester, academicYear } = input;
      const marksCollection = database.getCollection('marks');

      const mark = {
        studentId,
        subject,
        marks,
        maxMarks,
        semester,
        academicYear,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await marksCollection.insertOne(mark);
      return { ...mark, _id: result.insertedId };
    },

    updateMark: async (_: any, { id, input }: { id: string; input: any }, { user }: { user: any }) => {
      if (!user || user.role !== 'teacher') {
        throw new Error('Unauthorized');
      }

      const marksCollection = database.getCollection('marks');
      const updateData = { ...input, updatedAt: new Date() };

      const result = await marksCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      if (!result || !result.value) throw new Error('Mark not found');
      return { _id: id, ...result.value };
    },

    deleteMark: async (_: any, { id }: { id: string }, { user }: { user: any }) => {
      if (!user || user.role !== 'teacher') {
        throw new Error('Unauthorized');
      }

      const marksCollection = database.getCollection('marks');
      const result = await marksCollection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    }
  },

  // Field resolvers
  Mark: {
    student: async (parent: Mark) => {
      const studentsCollection = database.getCollection('students');
      return await studentsCollection.findOne({ _id: new ObjectId(parent.studentId) });
    }
  }
};
