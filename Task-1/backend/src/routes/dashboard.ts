import { Router } from 'express';
import { 
  getDashboardStats, 
  getTeacherStats, 
  getAllTeachers 
} from '../controllers/dashboardController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/dashboard/stats - Get dashboard statistics (Admin only)
router.get('/stats', authorizeRoles('admin'), getDashboardStats);

// GET /api/dashboard/teachers - Get all teachers (Admin only)
router.get('/teachers', authorizeRoles('admin'), getAllTeachers);

// GET /api/dashboard/teacher/:teacherId/stats - Get teacher statistics (Admin, Teacher)
router.get('/teacher/:teacherId/stats', authorizeRoles('admin', 'teacher'), getTeacherStats);

export default router;
