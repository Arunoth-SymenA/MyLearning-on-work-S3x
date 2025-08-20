import { Router } from 'express';
import { 
  addMark, 
  getAllMarks, 
  getMarksByStudent, 
  updateMark, 
  deleteMark, 
  downloadMarksExcel,
  downloadStudentMarksExcel,
  validateAddMark,
  validateUpdateMark
} from '../controllers/marksController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/marks - Get all marks (Admin, Teacher)
router.get('/', authorizeRoles('admin', 'teacher'), getAllMarks);

// POST /api/marks - Add new mark (Teacher only)
router.post('/', authorizeRoles('teacher'), validateAddMark, addMark);

// GET /api/marks/student/:studentId - Get marks by student (Admin, Teacher, Student)
router.get('/student/:studentId', authorizeRoles('admin', 'teacher', 'student'), getMarksByStudent);

// GET /api/marks/student/:studentId/download - Download student marks as Excel (Admin, Teacher, Student)
router.get('/student/:studentId/download', authorizeRoles('admin', 'teacher', 'student'), downloadStudentMarksExcel);

// PUT /api/marks/:id - Update mark (Teacher only)
router.put('/:id', authorizeRoles('teacher'), validateUpdateMark, updateMark);

// DELETE /api/marks/:id - Delete mark (Teacher only)
router.delete('/:id', authorizeRoles('teacher'), deleteMark);

// GET /api/marks/download - Download marks as Excel (Teacher only)
router.get('/download', authorizeRoles('teacher'), downloadMarksExcel);

export default router;
