import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../config/database';

export interface CanvasData {
  id?: number;
  name: string;
  canvas_data?: any;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface UserData {
  id?: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone?: string;
  roles: string[];
  status: 'Active' | 'Inactive';
  hiredDate?: string;
  lastLogin?: string | null;
  created_at?: string;
  updated_at?: string;
}

export class DatabaseService {
  
  // Safely parse roles from DB even if stored as CSV or JSON
  static parseRoles(raw: any): string[] {
    try {
      if (Array.isArray(raw)) return raw as string[];
      if (raw == null) return [];
      const asString = Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw);
      const trimmed = asString.trim();
      // JSON array/object
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed as string[];
        if (parsed && typeof parsed === 'object' && Array.isArray((parsed as any).roles)) {
          return (parsed as any).roles as string[];
        }
      }
      // CSV fallback
      if (trimmed.includes(',')) {
        return trimmed.split(',').map(r => r.trim()).filter(Boolean);
      }
      return trimmed ? [trimmed] : [];
    } catch {
      try {
        const asString = Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw);
        if (asString.includes(',')) {
          return asString.split(',').map(r => r.trim()).filter(Boolean);
        }
        return asString ? [asString.trim()] : [];
      } catch {
        return [];
      }
    }
  }

  // Save canvas data to database
  static async saveCanvas(canvasData: any, name: string): Promise<ApiResponse<CanvasData>> {
    try {
      const connection = await pool.getConnection();
      
      const query = `
        INSERT INTO canvases (name, canvas_data) 
        VALUES (?, ?)
      `;
      
      const [result] = await connection.execute<ResultSetHeader>(
        query, 
        [name, JSON.stringify(canvasData)]
      );
      
      connection.release();
      
      if (result.affectedRows > 0) {
        return {
          success: true,
          message: 'Canvas saved successfully',
          data: {
            id: result.insertId,
            name,
            canvas_data: canvasData,
            created_at: new Date().toISOString()
          }
        };
      } else {
        return {
          success: false,
          message: 'Failed to save canvas'
        };
      }
    } catch (error) {
      console.error('Database error in saveCanvas:', error);
      return {
        success: false,
        message: 'Database error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get list of all canvases
  static async getCanvasList(): Promise<ApiResponse<CanvasData[]>> {
    try {
      const connection = await pool.getConnection();
      
      const query = `
        SELECT id, name, created_at, updated_at 
        FROM canvases 
        ORDER BY updated_at DESC
      `;
      
      const [rows] = await connection.execute<RowDataPacket[]>(query);
      connection.release();
      
      const canvases: CanvasData[] = rows.map(row => ({
        id: row['id'],
        name: row['name'],
        created_at: row['created_at'],
        updated_at: row['updated_at']
      }));
      
      return {
        success: true,
        data: canvases
      };
    } catch (error) {
      console.error('Database error in getCanvasList:', error);
      return {
        success: false,
        message: 'Failed to fetch canvas list',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get specific canvas by ID
  static async getCanvas(id: string): Promise<ApiResponse<CanvasData>> {
    try {
      const connection = await pool.getConnection();
      
      const query = `
        SELECT id, name, canvas_data, created_at, updated_at 
        FROM canvases 
        WHERE id = ?
      `;
      
      const [rows] = await connection.execute<RowDataPacket[]>(query, [id]);
      connection.release();
      
      if (rows.length === 0) {
        return {
          success: false,
          message: 'Canvas not found'
        };
      }
      
      const canvas = rows[0];
      return {
        success: true,
        data: {
          id: canvas['id'],
          name: canvas['name'],
          canvas_data: JSON.parse(canvas['canvas_data']),
          created_at: canvas['created_at'],
          updated_at: canvas['updated_at']
        }
      };
    } catch (error) {
      console.error('Database error in getCanvas:', error);
      return {
        success: false,
        message: 'Failed to fetch canvas',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Update existing canvas
  static async updateCanvas(id: string, canvasData: any, name?: string): Promise<ApiResponse<CanvasData>> {
    try {
      const connection = await pool.getConnection();
      
      let query: string;
      let params: any[];
      
      if (name) {
        query = `
          UPDATE canvases 
          SET canvas_data = ?, name = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `;
        params = [JSON.stringify(canvasData), name, id];
      } else {
        query = `
          UPDATE canvases 
          SET canvas_data = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `;
        params = [JSON.stringify(canvasData), id];
      }
      
      const [result] = await connection.execute<ResultSetHeader>(query, params);
      connection.release();
      
      if (result.affectedRows > 0) {
        return {
          success: true,
          message: 'Canvas updated successfully',
          data: {
            id: parseInt(id),
            name: name || 'Updated Canvas',
            canvas_data: canvasData,
            updated_at: new Date().toISOString()
          }
        };
      } else {
        return {
          success: false,
          message: 'Canvas not found or no changes made'
        };
      }
    } catch (error) {
      console.error('Database error in updateCanvas:', error);
      return {
        success: false,
        message: 'Failed to update canvas',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Delete canvas by ID
  static async deleteCanvas(id: string): Promise<ApiResponse> {
    try {
      const connection = await pool.getConnection();
      
      const query = `DELETE FROM canvases WHERE id = ?`;
      const [result] = await connection.execute<ResultSetHeader>(query, [id]);
      connection.release();
      
      if (result.affectedRows > 0) {
        return {
          success: true,
          message: 'Canvas deleted successfully'
        };
      } else {
        return {
          success: false,
          message: 'Canvas not found'
        };
      }
    } catch (error) {
      console.error('Database error in deleteCanvas:', error);
      return {
        success: false,
        message: 'Failed to delete canvas',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Health check for database connection
  static async healthCheck(): Promise<ApiResponse> {
    try {
      const connection = await pool.getConnection();
      await connection.execute('SELECT 1');
      connection.release();
      
      return {
        success: true,
        message: 'Database connection is healthy'
      };
    } catch (error) {
      console.error('Database health check failed:', error);
      return {
        success: false,
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // User/Employee related methods

  // Get all users with optional filtering
  static async getUsers(role?: string, status?: string): Promise<ApiResponse<UserData[]>> {
    try {
      const connection = await pool.getConnection();
      
      let query = `
        SELECT id, first_name, middle_name, last_name, email, phone, roles, status, hired_date, last_login, created_at
        FROM users
      `;
      
      const conditions: string[] = [];
      const params: any[] = [];
      
      if (status && status !== 'All Employees') {
        conditions.push('Status = ?');
        params.push(status);
      }
      
      if (role && role !== 'All Employees' && !['Active', 'Inactive'].includes(role)) {
        conditions.push('Roles LIKE ?');
        params.push(`%${role}%`);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY created_at DESC';
      
      const [rows] = await connection.execute<RowDataPacket[]>(query, params);
      connection.release();
      
      const users: UserData[] = rows.map(row => {
        return {
          id: row['id'],
          firstName: row['first_name'] || '',
          middleName: row['middle_name'] || undefined,
          lastName: row['last_name'] || '',
          email: row['email'],
          phone: row['phone'],
          roles: this.parseRoles(row['roles']),
          status: row['status'],
          hiredDate: row['hired_date'],
          lastLogin: row['last_login'],
          created_at: row['created_at'],
          updated_at: row['created_at']
        };
      });
      
      return {
        success: true,
        data: users
      };
    } catch (error) {
      console.error('Database error in getUsers:', error);
      return {
        success: false,
        message: 'Failed to fetch users',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get specific user by ID
  static async getUser(id: string): Promise<ApiResponse<UserData>> {
    try {
      const connection = await pool.getConnection();
      
      const query = `
        SELECT id, first_name, middle_name, last_name, email, phone, roles, status, hired_date, last_login, created_at
        FROM users
        WHERE id = ?
      `;
      
      const [rows] = await connection.execute<RowDataPacket[]>(query, [id]);
      connection.release();
      
      if (rows.length === 0) {
        return {
          success: false,
          message: 'User not found'
        };
      }
      
      const user = rows[0];
      
      return {
        success: true,
        data: {
          id: user['id'],
          firstName: user['first_name'] || '',
          middleName: user['middle_name'] || undefined,
          lastName: user['last_name'] || '',
          email: user['email'],
          phone: user['phone'],
          roles: this.parseRoles(user['roles']),
          status: user['status'],
          hiredDate: user['hired_date'],
          lastLogin: user['last_login'],
          created_at: user['created_at'],
          updated_at: user['created_at']
        }
      };
    } catch (error) {
      console.error('Database error in getUser:', error);
      return {
        success: false,
        message: 'Failed to fetch user',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Create new user
  static async createUser(userData: Omit<UserData, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<UserData>> {
    try {
      const connection = await pool.getConnection();
      
      const query = `
        INSERT INTO users (first_name, middle_name, last_name, email, phone, roles, status, hired_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await connection.execute<ResultSetHeader>(
        query,
        [
          userData.firstName,
          userData.middleName || null,
          userData.lastName,
          userData.email,
          userData.phone || null,
          JSON.stringify(userData.roles),
          userData.status,
          userData.hiredDate || null
        ]
      );
      
      connection.release();
      
      if (result.affectedRows > 0) {
        return {
          success: true,
          message: 'User created successfully',
          data: {
            id: result.insertId,
            ...userData,
            created_at: new Date().toISOString()
          }
        };
      } else {
        return {
          success: false,
          message: 'Failed to create user'
        };
      }
    } catch (error) {
      console.error('Database error in createUser:', error);
      return {
        success: false,
        message: 'Database error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Update existing user
  static async updateUser(id: string, userData: Partial<Omit<UserData, 'id' | 'created_at' | 'updated_at'>>): Promise<ApiResponse<UserData>> {
    try {
      const connection = await pool.getConnection();
      
      const updateFields: string[] = [];
      const params: any[] = [];
      
      if (userData.firstName !== undefined) {
        updateFields.push('first_name = ?');
        params.push(userData.firstName);
      }
      if (userData.middleName !== undefined) {
        updateFields.push('middle_name = ?');
        params.push(userData.middleName);
      }
      if (userData.lastName !== undefined) {
        updateFields.push('last_name = ?');
        params.push(userData.lastName);
      }
      if (userData.email !== undefined) {
        updateFields.push('email = ?');
        params.push(userData.email);
      }
      if (userData.phone !== undefined) {
        updateFields.push('phone = ?');
        params.push(userData.phone);
      }
      if (userData.roles !== undefined) {
        updateFields.push('roles = ?');
        params.push(JSON.stringify(userData.roles));
      }
      if (userData.status !== undefined) {
        updateFields.push('status = ?');
        params.push(userData.status);
      }
      if (userData.hiredDate !== undefined) {
        updateFields.push('hired_date = ?');
        params.push(userData.hiredDate);
      }
      
      if (updateFields.length === 0) {
        return {
          success: false,
          message: 'No fields to update'
        };
      }
      
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);
      
      const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
      
      const [result] = await connection.execute<ResultSetHeader>(query, params);
      connection.release();
      
      if (result.affectedRows > 0) {
        return {
          success: true,
          message: 'User updated successfully'
        };
      } else {
        return {
          success: false,
          message: 'User not found or no changes made'
        };
      }
    } catch (error) {
      console.error('Database error in updateUser:', error);
      return {
        success: false,
        message: 'Failed to update user',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Delete user by ID
  static async deleteUser(id: string): Promise<ApiResponse> {
    try {
      const connection = await pool.getConnection();
      
      const query = `DELETE FROM users WHERE id = ?`;
      const [result] = await connection.execute<ResultSetHeader>(query, [id]);
      connection.release();
      
      if (result.affectedRows > 0) {
        return {
          success: true,
          message: 'User deleted successfully'
        };
      } else {
        return {
          success: false,
          message: 'User not found'
        };
      }
    } catch (error) {
      console.error('Database error in deleteUser:', error);
      return {
        success: false,
        message: 'Failed to delete user',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Update user last login timestamp
  static async updateUserLastLogin(id: string): Promise<ApiResponse> {
    try {
      const connection = await pool.getConnection();
      
      const query = `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`;
      const [result] = await connection.execute<ResultSetHeader>(query, [id]);
      connection.release();
      
      if (result.affectedRows > 0) {
        return {
          success: true,
          message: 'User last login updated successfully'
        };
      } else {
        return {
          success: false,
          message: 'User not found'
        };
      }
    } catch (error) {
      console.error('Database error in updateUserLastLogin:', error);
      return {
        success: false,
        message: 'Failed to update user last login',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}