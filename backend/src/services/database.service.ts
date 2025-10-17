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

<<<<<<< HEAD
export class DatabaseService {
  
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
      
=======
export interface UserData {
  id?: number;
  FullName?: string; // Database format
  firstName?: string; // Frontend format
  middleName?: string; // Frontend format
  lastName?: string; // Frontend format
  Email?: string;
  email?: string; // Alias for frontend
  Phone?: string;
  phone?: string; // Alias for frontend
  Roles?: string; // Database format - JSON string
  roles?: string[]; // Frontend format - array
  Status?: 'Active' | 'Inactive';
  status?: 'Active' | 'Inactive'; // Alias for frontend
  hired_date?: string;
  hiredDate?: string; // Alias for frontend
  last_login?: string | null;
  lastLogin?: string | null; // Alias for frontend
  created_at?: string;
  updated_at?: string;
}

export class DatabaseService {
  // Parse roles safely
  static parseRoles(raw: any): string[] {
    try {
      // Already an array (MySQL JSON type automatically parsed)
      if (Array.isArray(raw)) return raw;
      if (raw == null) return [];
      
      // Handle Buffer (from some MySQL drivers)
      if (Buffer.isBuffer(raw)) {
        const str = raw.toString('utf8').trim();
        if (str.startsWith('[')) return JSON.parse(str);
        return str.split(',').map(r => r.trim()).filter(Boolean);
      }
      
      // Handle objects (already parsed JSON from Aiven/mysql2)
      if (typeof raw === 'object') {
        return Array.isArray(raw) ? raw : [];
      }
      
      // Handle strings
      const asString = String(raw).trim();
      if (asString.startsWith('[')) {
        return JSON.parse(asString);
      }
      
      // Handle comma-separated values
      return asString.split(',').map(r => r.trim()).filter(Boolean);
    } catch (error) {
      console.error('Error parsing roles:', error, 'Raw value:', raw);
      return [];
    }
  }

  // === CANVAS METHODS ===
  static async saveCanvas(canvasData: any, name: string): Promise<ApiResponse<CanvasData>> {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO canvases (name, canvas_data) VALUES (?, ?)`,
        [name, JSON.stringify(canvasData)]
      );
      connection.release();
      return {
        success: result.affectedRows > 0,
        message: 'Canvas saved successfully',
        data: {
          id: result.insertId,
          name,
          canvas_data: canvasData,
          created_at: new Date().toISOString()
        }
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  static async getCanvasList(): Promise<ApiResponse<CanvasData[]>> {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute<RowDataPacket[]>(`
        SELECT id, name, created_at, updated_at FROM canvases ORDER BY updated_at DESC
      `);
      connection.release();
      return { success: true, data: rows as any };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  static async getCanvas(id: string): Promise<ApiResponse<CanvasData>> {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT * FROM canvases WHERE id = ?`,
        [id]
      );
      connection.release();
      if (rows.length === 0)
        return { success: false, message: 'Canvas not found' };
>>>>>>> signup-dev
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
<<<<<<< HEAD
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
=======
      return { success: false, error: (error as Error).message };
    }
  }

  // === USER METHODS ===

  static async getUsers(role?: string, status?: string): Promise<ApiResponse<UserData[]>> {
    try {
      const connection = await pool.getConnection();
      let query = `
        SELECT UserId, FullName, Email, Phone, Roles, Status, hired_date, last_login, created_at
        FROM Users
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

      if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
      query += ' ORDER BY created_at DESC';

      const [rows] = await connection.execute<RowDataPacket[]>(query, params);
      connection.release();

      const users: UserData[] = rows.map(row => {
        // Parse FullName into firstName, middleName, lastName
        const nameParts = row['FullName'].trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
        const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';
        
        // Parse Roles JSON
        const rolesData = this.parseRoles(row['Roles']);

        return {
          id: row['UserId'],
          firstName: firstName,
          middleName: middleName || undefined,
          lastName: lastName,
          email: row['Email'],
          phone: row['Phone'],
          roles: rolesData,
          status: row['Status'],
          hiredDate: row['hired_date'],
          lastLogin: row['last_login'],
          created_at: row['created_at'],
          updated_at: row['update_at']
        };
      });

      return { success: true, data: users };
    } catch (error) {
      return { success: false, message: 'Failed to fetch users', error: (error as Error).message };
    }
  }

  static async getUser(id: string): Promise<ApiResponse<UserData>> {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT UserId, FullName, Email, Phone, Roles, Status, hired_date, last_login, created_at FROM Users WHERE UserId = ?`,
        [id]
      );
      connection.release();
      if (rows.length === 0) return { success: false, message: 'User not found' };
      const u = rows[0];
      
      // Parse FullName into firstName, middleName, lastName
      const nameParts = u['FullName'].trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
      const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';
      
      // Parse Roles JSON
      const rolesData = this.parseRoles(u['Roles']);
      
      return {
        success: true,
        data: {
          id: u['UserId'],
          firstName: firstName,
          middleName: middleName || undefined,
          lastName: lastName,
          email: u['Email'],
          phone: u['Phone'],
          roles: rolesData,
          status: u['Status'],
          hiredDate: u['hired_date'],
          lastLogin: u['last_login'],
          created_at: u['created_at'],
          updated_at: u['update_at']
        }
      };
    } catch (error) {
      return { success: false, message: 'Failed to fetch user', error: (error as Error).message };
    }
  }

  static async createUser(userData: Omit<UserData, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<UserData>> {
    try {
      const connection = await pool.getConnection();
      const query = `
        INSERT INTO Users (FullName, Email, Phone, PasswordHash, Roles, Status, hired_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const defaultPasswordHash = '$2b$10$defaultHashForNewUsers12345678901234567890123456789';
      const [result] = await connection.execute<ResultSetHeader>(
        query,
        [
          userData.FullName,
          userData.Email,
          userData.Phone || '',
          defaultPasswordHash,
          userData.Roles,
          userData.Status,
          userData.hired_date || null
        ]
      );
      connection.release();

      return {
        success: true,
        message: 'User created successfully',
        data: { id: result.insertId, ...userData, created_at: new Date().toISOString() }
      };
    } catch (error) {
      return { success: false, message: 'Failed to create user', error: (error as Error).message };
    }
  }

  static async updateUser(id: string, userData: Partial<UserData>): Promise<ApiResponse> {
    try {
      const connection = await pool.getConnection();
      const updateFields: string[] = [];
      const params: any[] = [];

      if (userData.FullName) {
        updateFields.push('FullName = ?');
        params.push(userData.FullName);
      }
      if (userData.Email) {
        updateFields.push('Email = ?');
        params.push(userData.Email);
      }
      if (userData.Phone) {
        updateFields.push('Phone = ?');
        params.push(userData.Phone);
      }
      if (userData.Roles) {
        updateFields.push('Roles = ?');
        params.push(userData.Roles);
      }
      if (userData.Status) {
        updateFields.push('Status = ?');
        params.push(userData.Status);
      }
      if (userData.hired_date) {
        updateFields.push('hired_date = ?');
        params.push(userData.hired_date);
      }

      if (updateFields.length === 0)
        return { success: false, message: 'No fields to update' };

      params.push(id);

      const query = `UPDATE Users SET ${updateFields.join(', ')} WHERE UserId = ?`;
      const [result] = await connection.execute<ResultSetHeader>(query, params);
      connection.release();

      return {
        success: result.affectedRows > 0,
        message: result.affectedRows > 0 ? 'User updated successfully' : 'No changes made'
      };
    } catch (error) {
      return { success: false, message: 'Failed to update user', error: (error as Error).message };
    }
  }

  static async deleteUser(id: string): Promise<ApiResponse> {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.execute<ResultSetHeader>(
        `DELETE FROM Users WHERE UserId = ?`,
        [id]
      );
      connection.release();
      return {
        success: result.affectedRows > 0,
        message: result.affectedRows > 0 ? 'User deleted successfully' : 'User not found'
      };
    } catch (error) {
      return { success: false, message: 'Failed to delete user', error: (error as Error).message };
    }
  }

  static async updateUserLastLogin(id: string): Promise<ApiResponse> {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.execute<ResultSetHeader>(
        `UPDATE Users SET last_login = CURRENT_TIMESTAMP WHERE UserId = ?`,
        [id]
      );
      connection.release();
      return {
        success: result.affectedRows > 0,
        message: result.affectedRows > 0 ? 'Last login updated' : 'User not found'
      };
    } catch (error) {
      return { success: false, message: 'Failed to update last login', error: (error as Error).message };
    }
  }


static async healthCheck() {
  try {
    const connection = await pool.getConnection();
    await connection.execute('SELECT 1 + 1 AS result');
    connection.release();

    return { success: true, message: 'Database connection OK' };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}



static async updateCanvas(id: string, canvasData: any, name?: string): Promise<ApiResponse<CanvasData>> {
  try {
    const connection = await pool.getConnection();

    const query = `
      UPDATE canvases
      SET canvas_data = ?, name = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const [result] = await connection.execute<ResultSetHeader>(
      query,
      [JSON.stringify(canvasData), name, id]
    );

    connection.release();

    if ((result as ResultSetHeader).affectedRows > 0) {
      return {
        success: true,
        message: 'Canvas updated successfully',
        data: { id: parseInt(id), name, canvas_data: canvasData }
      };
    }

    return { success: false, message: 'Canvas not found' };
  } catch (error) {
    console.error('Error updating canvas:', error);
    return { success: false, message: 'Failed to update canvas', error: (error as Error).message };
  }
}

static async deleteCanvas(id: string): Promise<ApiResponse> {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.execute<ResultSetHeader>(
      `DELETE FROM canvases WHERE id = ?`,
      [id]
    );
    connection.release();

    return {
      success: (result as ResultSetHeader).affectedRows > 0,
      message: (result as ResultSetHeader).affectedRows > 0
        ? 'Canvas deleted successfully'
        : 'Canvas not found'
    };
  } catch (error) {
    console.error('Error deleting canvas:', error);
    return { success: false, message: 'Failed to delete canvas', error: (error as Error).message };
  }
}


}
>>>>>>> signup-dev
