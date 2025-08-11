import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ObjectId } from 'mongodb';
import database from '../config/database';
import { Mark, AddMarkRequest, UpdateMarkRequest, AuthRequest } from '../types';
import * as XLSX from 'xlsx';

export const addMark = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId, subject, marks, maxMarks, semester, academicYear }: AddMarkRequest = req.body;
    const teacherId = req.user!._id; // ObjectId

    const marksCollection = database.getCollection('marks');
    
    // Check if mark already exists for this student, subject, semester, and academic year
    const existingMark = await marksCollection.findOne({ 
      studentId, 
      subject, 
      semester, 
      academicYear 
    });
    
    if (existingMark) {
      return res.status(400).json({ message: 'Mark already exists for this student, subject, semester, and academic year' });
    }

    const newMark: Mark = {
      studentId,
      subject,
      marks,
      maxMarks,
      semester,
      academicYear,
      teacherId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await marksCollection.insertOne(newMark);

    res.status(201).json({
      message: 'Mark added successfully',
      mark: {
        _id: result.insertedId,
        ...newMark
      }
    });
  } catch (error) {
    console.error('Add mark error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllMarks = async (req: Request, res: Response) => {
  try {
    const marksCollection = database.getCollection('marks');
    const studentsCollection = database.getCollection('students');
    
    const marks = await marksCollection.find({}).toArray();
    
    // Populate student information
    const marksWithStudentInfo = await Promise.all(
      marks.map(async (mark) => {
        const student = await studentsCollection.findOne({ _id: new ObjectId(mark.studentId) });
        return {
          ...mark,
          studentName: student?.name || 'Unknown Student',
          studentEmail: student?.email || 'Unknown Email'
        };
      })
    );

    res.json({
      message: 'Marks retrieved successfully',
      marks: marksWithStudentInfo
    });
  } catch (error) {
    console.error('Get marks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMarksByStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    const userRole = req.user!.role;
    const userEmail = req.user!.email;

    const marksCollection = database.getCollection('marks');
    const studentsCollection = database.getCollection('students');

    // If student, only allow access to their own marks
    if (userRole === 'student') {
      const student = await studentsCollection.findOne({ email: userEmail });
      if (!student || student._id?.toString() !== studentId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const marks = await marksCollection.find({ studentId }).toArray();
    const student = await studentsCollection.findOne({ _id: new ObjectId(studentId) });

    res.json({
      message: 'Student marks retrieved successfully',
      student: {
        _id: student?._id,
        name: student?.name,
        email: student?.email,
        studentId: student?.studentId
      },
      marks
    });
  } catch (error) {
    console.error('Get student marks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateMark = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { marks, maxMarks }: UpdateMarkRequest = req.body;

    const marksCollection = database.getCollection('marks');
    
    const result = await marksCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          marks, 
          maxMarks, 
          updatedAt: new Date() 
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Mark not found' });
    }

    res.json({
      message: 'Mark updated successfully'
    });
  } catch (error) {
    console.error('Update mark error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteMark = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const marksCollection = database.getCollection('marks');

    const result = await marksCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Mark not found' });
    }

    res.json({
      message: 'Mark deleted successfully'
    });
  } catch (error) {
    console.error('Delete mark error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const downloadMarksExcel = async (req: Request, res: Response) => {
  try {
    const marksCollection = database.getCollection('marks');
    const studentsCollection = database.getCollection('students');
    
    const marks = await marksCollection.find({}).toArray();
    
    // Populate student information
    const marksWithStudentInfo = await Promise.all(
      marks.map(async (mark) => {
        const student = await studentsCollection.findOne({ _id: new ObjectId(mark.studentId) });
        return {
          StudentName: student?.name || 'Unknown Student',
          StudentEmail: student?.email || 'Unknown Email',
          StudentID: student?.studentId || 'Unknown ID',
          Subject: mark.subject,
          Marks: mark.marks,
          MaxMarks: mark.maxMarks,
          Percentage: ((mark.marks / mark.maxMarks) * 100).toFixed(2) + '%',
          Semester: mark.semester,
          AcademicYear: mark.academicYear,
          DateAdded: mark.createdAt?.toLocaleDateString() || 'Unknown'
        };
      })
    );

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(marksWithStudentInfo);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Marks');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=student_marks.xlsx');
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
  } catch (error) {
    console.error('Download marks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const downloadStudentMarksExcel = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    const userRole = req.user!.role;
    const userEmail = req.user!.email;

    const marksCollection = database.getCollection('marks');
    const studentsCollection = database.getCollection('students');

    // If student, only allow access to their own marks
    if (userRole === 'student') {
      const student = await studentsCollection.findOne({ email: userEmail });
      if (!student || student._id?.toString() !== studentId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Get student information
    const student = await studentsCollection.findOne({ _id: new ObjectId(studentId) });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get marks for the specific student
    const marks = await marksCollection.find({ studentId }).toArray();
    
    // Prepare data for Excel
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
    const summaryRow = {
      Subject: 'TOTAL',
      Marks: marks.reduce((sum, mark) => sum + mark.marks, 0),
      MaxMarks: marks.reduce((sum, mark) => sum + mark.maxMarks, 0),
      Percentage: marks.length > 0 ? 
        ((marks.reduce((sum, mark) => sum + mark.marks, 0) / marks.reduce((sum, mark) => sum + mark.maxMarks, 0)) * 100).toFixed(2) + '%' : '0%',
      Semester: '',
      AcademicYear: '',
      DateAdded: ''
    };

    marksData.push(summaryRow);

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(marksData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, `${student.name} Marks`);

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${student.name}_marks.xlsx`);
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
  } catch (error) {
    console.error('Download student marks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const validateAddMark = [
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('marks').isNumeric().withMessage('Marks must be a number'),
  body('maxMarks').isNumeric().withMessage('Max marks must be a number'),
  body('semester').notEmpty().withMessage('Semester is required'),
  body('academicYear').notEmpty().withMessage('Academic year is required')
];

export const validateUpdateMark = [
  body('marks').isNumeric().withMessage('Marks must be a number'),
  body('maxMarks').isNumeric().withMessage('Max marks must be a number')
];
