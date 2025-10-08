"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const database_1 = require("../config/database");
class DatabaseService {
    static parseRoles(raw) {
        try {
            if (Array.isArray(raw))
                return raw;
            if (raw == null)
                return [];
            const asString = Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw);
            const trimmed = asString.trim();
            if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed))
                    return parsed;
                if (parsed && typeof parsed === 'object' && Array.isArray(parsed.roles)) {
                    return parsed.roles;
                }
            }
            if (trimmed.includes(',')) {
                return trimmed.split(',').map(r => r.trim()).filter(Boolean);
            }
            return trimmed ? [trimmed] : [];
        }
        catch {
            try {
                const asString = Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw);
                if (asString.includes(',')) {
                    return asString.split(',').map(r => r.trim()).filter(Boolean);
                }
                return asString ? [asString.trim()] : [];
            }
            catch {
                return [];
            }
        }
    }
    static async saveCanvas(canvasData, name) {
        try {
            const connection = await database_1.pool.getConnection();
            const query = `
        INSERT INTO canvases (name, canvas_data) 
        VALUES (?, ?)
      `;
            const [result] = await connection.execute(query, [name, JSON.stringify(canvasData)]);
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
            }
            else {
                return {
                    success: false,
                    message: 'Failed to save canvas'
                };
            }
        }
        catch (error) {
            console.error('Database error in saveCanvas:', error);
            return {
                success: false,
                message: 'Database error occurred',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async getCanvasList() {
        try {
            const connection = await database_1.pool.getConnection();
            const query = `
        SELECT id, name, created_at, updated_at 
        FROM canvases 
        ORDER BY updated_at DESC
      `;
            const [rows] = await connection.execute(query);
            connection.release();
            const canvases = rows.map(row => ({
                id: row['id'],
                name: row['name'],
                created_at: row['created_at'],
                updated_at: row['updated_at']
            }));
            return {
                success: true,
                data: canvases
            };
        }
        catch (error) {
            console.error('Database error in getCanvasList:', error);
            return {
                success: false,
                message: 'Failed to fetch canvas list',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async getCanvas(id) {
        try {
            const connection = await database_1.pool.getConnection();
            const query = `
        SELECT id, name, canvas_data, created_at, updated_at 
        FROM canvases 
        WHERE id = ?
      `;
            const [rows] = await connection.execute(query, [id]);
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
        }
        catch (error) {
            console.error('Database error in getCanvas:', error);
            return {
                success: false,
                message: 'Failed to fetch canvas',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async updateCanvas(id, canvasData, name) {
        try {
            const connection = await database_1.pool.getConnection();
            let query;
            let params;
            if (name) {
                query = `
          UPDATE canvases 
          SET canvas_data = ?, name = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `;
                params = [JSON.stringify(canvasData), name, id];
            }
            else {
                query = `
          UPDATE canvases 
          SET canvas_data = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `;
                params = [JSON.stringify(canvasData), id];
            }
            const [result] = await connection.execute(query, params);
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
            }
            else {
                return {
                    success: false,
                    message: 'Canvas not found or no changes made'
                };
            }
        }
        catch (error) {
            console.error('Database error in updateCanvas:', error);
            return {
                success: false,
                message: 'Failed to update canvas',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async deleteCanvas(id) {
        try {
            const connection = await database_1.pool.getConnection();
            const query = `DELETE FROM canvases WHERE id = ?`;
            const [result] = await connection.execute(query, [id]);
            connection.release();
            if (result.affectedRows > 0) {
                return {
                    success: true,
                    message: 'Canvas deleted successfully'
                };
            }
            else {
                return {
                    success: false,
                    message: 'Canvas not found'
                };
            }
        }
        catch (error) {
            console.error('Database error in deleteCanvas:', error);
            return {
                success: false,
                message: 'Failed to delete canvas',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async healthCheck() {
        try {
            const connection = await database_1.pool.getConnection();
            await connection.execute('SELECT 1');
            connection.release();
            return {
                success: true,
                message: 'Database connection is healthy'
            };
        }
        catch (error) {
            console.error('Database health check failed:', error);
            return {
                success: false,
                message: 'Database connection failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async getUsers(role, status) {
        try {
            const connection = await database_1.pool.getConnection();
            let query = `
        SELECT UserID, FullName, Email, Phone, Roles, Status, hired_date, last_login, created_at
        FROM Users
      `;
            const conditions = [];
            const params = [];
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
            const [rows] = await connection.execute(query, params);
            connection.release();
            const users = rows.map(row => {
                const fullName = row['FullName'] || '';
                const nameParts = fullName.split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';
                return {
                    id: row['UserID'],
                    firstName: firstName,
                    lastName: lastName,
                    email: row['Email'],
                    phone: row['Phone'],
                    roles: row['Roles'] ? row['Roles'].split(',').map((r) => r.trim()) : [],
                    status: row['Status'],
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
        }
        catch (error) {
            console.error('Database error in getUsers:', error);
            return {
                success: false,
                message: 'Failed to fetch users',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async getUser(id) {
        try {
            const connection = await database_1.pool.getConnection();
            const query = `
        SELECT UserID, FullName, Email, Phone, Roles, Status, hired_date, last_login, created_at
        FROM Users
        WHERE UserID = ?
      `;
            const [rows] = await connection.execute(query, [id]);
            connection.release();
            if (rows.length === 0) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }
            const user = rows[0];
            const fullName = user['FullName'] || '';
            const nameParts = fullName.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            return {
                success: true,
                data: {
                    id: user['UserID'],
                    firstName: firstName,
                    lastName: lastName,
                    email: user['Email'],
                    phone: user['Phone'],
                    roles: user['Roles'] ? user['Roles'].split(',').map((r) => r.trim()) : [],
                    status: user['Status'],
                    hiredDate: user['hired_date'],
                    lastLogin: user['last_login'],
                    created_at: user['created_at'],
                    updated_at: user['created_at']
                }
            };
        }
        catch (error) {
            console.error('Database error in getUser:', error);
            return {
                success: false,
                message: 'Failed to fetch user',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async createUser(userData) {
        try {
            const connection = await database_1.pool.getConnection();
            const query = `
        INSERT INTO users (first_name, last_name, email, phone, roles, status, hired_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
            const [result] = await connection.execute(query, [
                userData.firstName,
                userData.lastName,
                userData.email,
                userData.phone || null,
                JSON.stringify(userData.roles),
                userData.status,
                userData.hiredDate || null
            ]);
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
            }
            else {
                return {
                    success: false,
                    message: 'Failed to create user'
                };
            }
        }
        catch (error) {
            console.error('Database error in createUser:', error);
            return {
                success: false,
                message: 'Database error occurred',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async updateUser(id, userData) {
        try {
            const connection = await database_1.pool.getConnection();
            const updateFields = [];
            const params = [];
            if (userData.firstName !== undefined) {
                updateFields.push('first_name = ?');
                params.push(userData.firstName);
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
            const [result] = await connection.execute(query, params);
            connection.release();
            if (result.affectedRows > 0) {
                return {
                    success: true,
                    message: 'User updated successfully'
                };
            }
            else {
                return {
                    success: false,
                    message: 'User not found or no changes made'
                };
            }
        }
        catch (error) {
            console.error('Database error in updateUser:', error);
            return {
                success: false,
                message: 'Failed to update user',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async deleteUser(id) {
        try {
            const connection = await database_1.pool.getConnection();
            const query = `DELETE FROM users WHERE id = ?`;
            const [result] = await connection.execute(query, [id]);
            connection.release();
            if (result.affectedRows > 0) {
                return {
                    success: true,
                    message: 'User deleted successfully'
                };
            }
            else {
                return {
                    success: false,
                    message: 'User not found'
                };
            }
        }
        catch (error) {
            console.error('Database error in deleteUser:', error);
            return {
                success: false,
                message: 'Failed to delete user',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async updateUserLastLogin(id) {
        try {
            const connection = await database_1.pool.getConnection();
            const query = `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`;
            const [result] = await connection.execute(query, [id]);
            connection.release();
            if (result.affectedRows > 0) {
                return {
                    success: true,
                    message: 'User last login updated successfully'
                };
            }
            else {
                return {
                    success: false,
                    message: 'User not found'
                };
            }
        }
        catch (error) {
            console.error('Database error in updateUserLastLogin:', error);
            return {
                success: false,
                message: 'Failed to update user last login',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=database.service.js.map