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