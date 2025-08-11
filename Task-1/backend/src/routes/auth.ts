import { Router } from 'express';
import { login, register, validateLogin, validateRegister } from '../controllers/authController';

const router = Router();

// POST /api/auth/login
router.post('/login', validateLogin, login);

// POST /api/auth/register
router.post('/register', validateRegister, register);

export default router;
