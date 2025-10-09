import { Request, Response, Router } from 'express';
import { DatabaseService } from '../services/database.service';

const router = Router();

/**
 * GET /api/users
 * Optional query params: role, status
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { role, status } = req.query;
    const result = await DatabaseService.getUsers(
      role as string | undefined,
      status as string | undefined
    );
    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/users/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await DatabaseService.getUser(id);
    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/users
 * Body: { fullName, email, phone, roles, status?, hired_date? }
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, roles, status, hired_date } = req.body;

    if (!fullName || !email || !roles) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and roles are required',
      });
    }

    const result = await DatabaseService.createUser({
      FullName: fullName,
      Email: email,
      Phone: phone,
      Roles: roles,
      Status: status || 'Active',
      hired_date,
    });


    res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PUT /api/users/:id
 * Body: { fullName?, email?, phone?, roles?, status?, hired_date? }
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await DatabaseService.updateUser(id, req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/users/:id
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await DatabaseService.deleteUser(id);
    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PATCH /api/users/:id/last-login
 */
router.patch('/:id/last-login', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await DatabaseService.updateUserLastLogin(id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Error updating last login:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update last login',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
