import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher' | 'student';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Student {
  _id?: ObjectId;
  name: string;
  email: string;
  studentId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Subject {
  name: string;
  code: string;
}

export interface Mark {
  _id?: ObjectId;
  studentId: string;
  subject: string;
  marks: number;
  maxMarks: number;
  semester: string;
  academicYear: string;
  teacherId: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    _id: ObjectId;
    email: string;
    role: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher' | 'student';
}

export interface AddStudentRequest {
  name: string;
  email: string;
  studentId: string;
}

export interface AddMarkRequest {
  studentId: string;
  subject: string;
  marks: number;
  maxMarks: number;
  semester: string;
  academicYear: string;
}

export interface UpdateMarkRequest {
  marks: number;
  maxMarks: number;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalMarks: number;
}

export interface TeacherStats {
  studentsHandled: number;
  marksEntries: number;
}
