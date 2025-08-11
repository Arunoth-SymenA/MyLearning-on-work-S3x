import { Router } from 'express';
import { 
  addStudent, 
  getAllStudents, 
  getStudentById, 
  updateStudent, 
  deleteStudent, 
  validateAddStudent,
  getStudentByEmail
} from '../controllers/studentController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/students - Get all students (Admin, Teacher - for marks management)
router.get('/', authorizeRoles('admin', 'teacher'), getAllStudents);

// GET /api/students/email/:email - Get student by email (Student - for their own data)
router.get('/email/:email', authorizeRoles('student'), getStudentByEmail);

// POST /api/students - Add new student (Admin only)
router.post('/', authorizeRoles('admin'), validateAddStudent, addStudent);

// GET /api/students/:id - Get student by ID (Admin, Teacher)
router.get('/:id', authorizeRoles('admin', 'teacher'), getStudentById);

// PUT /api/students/:id - Update student (Admin only)
router.put('/:id', authorizeRoles('admin'), updateStudent);

// DELETE /api/students/:id - Delete student (Admin only)
router.delete('/:id', authorizeRoles('admin'), deleteStudent);

export default router;
