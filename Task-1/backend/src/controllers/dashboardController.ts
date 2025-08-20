import { Request, Response } from 'express';
import database from '../config/database';
import { DashboardStats, TeacherStats } from '../types';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const studentsCollection = database.getCollection('students');
    const usersCollection = database.getCollection('users');
    const marksCollection = database.getCollection('marks');

    // Get counts
    const totalStudents = await studentsCollection.countDocuments();
    const totalTeachers = await usersCollection.countDocuments({ role: 'teacher' });
    const totalMarks = await marksCollection.countDocuments();

    const stats: DashboardStats = {
      totalStudents,
      totalTeachers,
      totalMarks
    };

    res.json({
      message: 'Dashboard stats retrieved successfully',
      stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTeacherStats = async (req: Request, res: Response) => {
  try {
    const { teacherId } = req.params;
    const marksCollection = database.getCollection('marks');

    // Get unique students handled by this teacher
    const studentsHandled = await marksCollection.distinct('studentId', { teacherId });
    const marksEntries = await marksCollection.countDocuments({ teacherId });

    const stats: TeacherStats = {
      studentsHandled: studentsHandled.length,
      marksEntries
    };

    res.json({
      message: 'Teacher stats retrieved successfully',
      stats
    });
  } catch (error) {
    console.error('Get teacher stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllTeachers = async (req: Request, res: Response) => {
  try {
    const usersCollection = database.getCollection('users');
    const teachers = await usersCollection.find({ role: 'teacher' }).toArray();

    // Remove password from response
    const teachersWithoutPassword = teachers.map(teacher => ({
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      role: teacher.role,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt
    }));

    res.json({
      message: 'Teachers retrieved successfully',
      teachers: teachersWithoutPassword
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
