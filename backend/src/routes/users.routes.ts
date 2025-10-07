import { Request, Response, Router } from 'express';
import { DatabaseService } from '../services/database.service';

const router = Router();

// Get all users/employees
router.get('/', async (req: Request, res: Response) => {
  try {
    const { role, status } = req.query;
    
    const result = await DatabaseService.getUsers(role as string, status as string);
    
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get user by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid user ID is required' 
      });
    }
    
    const result = await DatabaseService.getUser(id);
    
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Create new user
router.post('/', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, roles, status, hiredDate } = req.body;
    
    if (!firstName || !lastName || !email || !roles) {
      return res.status(400).json({ 
        success: false, 
        message: 'First name, last name, email, and roles are required' 
      });
    }
    
    const result = await DatabaseService.createUser({
      firstName,
      lastName,
      email,
      phone,
      roles,
      status: status || 'Active',
      hiredDate
    });
    
    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create user', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Update user
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, roles, status, hiredDate } = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid user ID is required' 
      });
    }
    
    const result = await DatabaseService.updateUser(id, {
      firstName,
      lastName,
      email,
      phone,
      roles,
      status,
      hiredDate
    });
    
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to update user', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Delete user
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid user ID is required' 
      });
    }
    
    const result = await DatabaseService.deleteUser(id);
    
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to delete user', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Update user last login
router.patch('/:id/login', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid user ID is required' 
      });
    }
    
    const result = await DatabaseService.updateUserLastLogin(id);
    
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to update user login', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export default router;