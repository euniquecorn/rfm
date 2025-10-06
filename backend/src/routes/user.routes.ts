import express = require('express');
import { DatabaseService } from '../services/database.service';

const router = express.Router();

// POST /users - Create new user (signup)
router.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Validate username length
    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Username must be at least 3 characters long'
      });
    }

    // Create user
    const result = await DatabaseService.createUser({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password
    });

    if (result.success) {
      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          id: result.data?.id,
          username: result.data?.username,
          email: result.data?.email,
          created_at: result.data?.created_at
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /users/login - User login
router.post('/login', async (req: express.Request, res: express.Response) => {
  try {
    const { usernameOrEmail, password } = req.body;

    // Validate required fields
    if (!usernameOrEmail || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username/email and password are required'
      });
    }

    // Get user by credentials
    const userResult = await DatabaseService.getUserByCredentials(usernameOrEmail);
    
    if (!userResult.success || !userResult.data) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Verify password
    const isPasswordValid = await DatabaseService.verifyPassword(password, userResult.data.password!);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Return user data (without password)
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: userResult.data.id,
        username: userResult.data.username,
        email: userResult.data.email,
        created_at: userResult.data.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;