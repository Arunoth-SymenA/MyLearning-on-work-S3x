import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import database from '../config/database';
import { generateToken } from '../middleware/auth';
import { User, LoginRequest, RegisterRequest } from '../types';

export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password }: LoginRequest = req.body;

    const usersCollection = database.getCollection('users');
    const user = await usersCollection.findOne({ email }) as User | null;

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Support legacy plaintext passwords then migrate to bcrypt on successful login
    let isPasswordValid = false;
    const storedPassword = user.password || '';
    if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$')) {
      isPasswordValid = await bcrypt.compare(password, storedPassword);
    } else {
      isPasswordValid = password === storedPassword;
      if (isPasswordValid) {
        try {
          const hashed = await bcrypt.hash(password, 10);
          const usersCollection = database.getCollection('users');
          await usersCollection.updateOne({ email: user.email }, { $set: { password: hashed, updatedAt: new Date() } });
        } catch (e) {
          // Non-fatal: login continues even if migration fails
          console.warn('Password migration failed for', user.email, e);
        }
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({
      _id: user._id!.toString(),
      email: user.email,
      role: user.role
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id?.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role }: RegisterRequest = req.body;

    const usersCollection = database.getCollection('users');
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser: User = {
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await usersCollection.insertOne(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: result.insertedId.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const validateLogin = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

export const validateRegister = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').isIn(['admin', 'teacher', 'student']).withMessage('Invalid role')
];
