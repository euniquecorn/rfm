import * as bcrypt from 'bcrypt';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../config/database';

export interface CanvasData {
  id?: number;
  name: string;
  canvas_data?: any;
  created_at?: string;
  updated_at?: string;
}

export interface UserData {
  id?: number;
  username: string;
  email: string;
  password?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export class DatabaseService {
  
  // Create new user account
  static async createUser(userData: { username: string; email: string; password: string }): Promise<ApiResponse<UserData>> {
    try {
      const connection = await pool.getConnection();
      
      // Check if username or email already exists
      const checkQuery = `
        SELECT id FROM users
        WHERE username = ? OR email = ?
      `;
      
      const [existingUsers] = await connection.execute<RowDataPacket[]>(
        checkQuery,
        [userData.username, userData.email]
      );
      
      if (existingUsers.length > 0) {
        connection.release();
        return {
          success: false,
          message: 'Username or email already exists'
        };
      }
      
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      // Insert new user
      const insertQuery = `
        INSERT INTO users (username, email, password)
        VALUES (?, ?, ?)
      `;
      
      const [result] = await connection.execute<ResultSetHeader>(
        insertQuery,
        [userData.username, userData.email, hashedPassword]
      );
      
      connection.release();
      
      if (result.affectedRows > 0) {
        return {
          success: true,
          message: 'User created successfully',
          data: {
            id: result.insertId,
            username: userData.username,
            email: userData.email,
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

  // Get user by username or email (for login)
  static async getUserByCredentials(usernameOrEmail: string): Promise<ApiResponse<UserData>> {
    try {
      const connection = await pool.getConnection();
      
      const query = `
        SELECT id, username, email, password, created_at, updated_at
        FROM users
        WHERE username = ? OR email = ?
      `;
      
      const [rows] = await connection.execute<RowDataPacket[]>(query, [usernameOrEmail, usernameOrEmail]);
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
          username: user['username'],
          email: user['email'],
          password: user['password'], // Include for password verification
          created_at: user['created_at'],
          updated_at: user['updated_at']
        }
      };
    } catch (error) {
      console.error('Database error in getUserByCredentials:', error);
      return {
        success: false,
        message: 'Failed to fetch user',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Verify user password
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
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
}