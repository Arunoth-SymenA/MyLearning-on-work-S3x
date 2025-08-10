import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ObjectId } from 'mongodb';
import database from '../config/database';
import { Student, AddStudentRequest } from '../types';

export const addStudent = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, studentId }: AddStudentRequest = req.body;

    const studentsCollection = database.getCollection('students');
    
    // Check if student already exists
    const existingStudent = await studentsCollection.findOne({ 
      $or: [{ email }, { studentId }] 
    });
    
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this email or ID already exists' });
    }

    const newStudent: Student = {
      name,
      email,
      studentId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await studentsCollection.insertOne(newStudent);

    res.status(201).json({
      message: 'Student added successfully',
      student: {
        _id: result.insertedId,
        ...newStudent
      }
    });
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const studentsCollection = database.getCollection('students');
    const students = await studentsCollection.find({}).toArray();

    res.json({
      message: 'Students retrieved successfully',
      students
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const studentsCollection = database.getCollection('students');
    
    const student = await studentsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      message: 'Student retrieved successfully',
      student
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStudentByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const studentsCollection = database.getCollection('students');
    
    const student = await studentsCollection.findOne({ email });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      message: 'Student retrieved successfully',
      student
    });
  } catch (error) {
    console.error('Get student by email error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const studentsCollection = database.getCollection('students');
    
    const result = await studentsCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          name, 
          email, 
          updatedAt: new Date() 
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      message: 'Student updated successfully'
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const studentsCollection = database.getCollection('students');
    const marksCollection = database.getCollection('marks');

    // Delete student
    const result = await studentsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete associated marks
    await marksCollection.deleteMany({ studentId: id });

    res.json({
      message: 'Student and associated marks deleted successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const validateAddStudent = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('studentId').notEmpty().withMessage('Student ID is required')
];
