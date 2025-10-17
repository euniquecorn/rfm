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
            if (Buffer.isBuffer(raw)) {
                const str = raw.toString('utf8').trim();
                if (str.startsWith('['))
                    return JSON.parse(str);
                return str.split(',').map(r => r.trim()).filter(Boolean);
            }
            if (typeof raw === 'object') {
                return Array.isArray(raw) ? raw : [];
            }
            const asString = String(raw).trim();
            if (asString.startsWith('[')) {
                return JSON.parse(asString);
            }
            return asString.split(',').map(r => r.trim()).filter(Boolean);
        }
        catch (error) {
            console.error('Error parsing roles:', error, 'Raw value:', raw);
            return [];
        }
    }
    static async saveCanvas(canvasData, name) {
        try {
            const connection = await database_1.pool.getConnection();
            const [result] = await connection.execute(`INSERT INTO canvases (name, canvas_data) VALUES (?, ?)`, [name, JSON.stringify(canvasData)]);
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
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    static async getCanvasList() {
        try {
            const connection = await database_1.pool.getConnection();
            const [rows] = await connection.execute(`
        SELECT id, name, created_at, updated_at FROM canvases ORDER BY updated_at DESC
      `);
            connection.release();
            return { success: true, data: rows };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    static async getCanvas(id) {
        try {
            const connection = await database_1.pool.getConnection();
            const [rows] = await connection.execute(`SELECT * FROM canvases WHERE id = ?`, [id]);
            connection.release();
            if (rows.length === 0)
                return { success: false, message: 'Canvas not found' };
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
            return { success: false, error: error.message };
        }
    }
    static async getUsers(role, status) {
        try {
            const connection = await database_1.pool.getConnection();
            let query = `
        SELECT UserId, FullName, Email, Phone, Roles, Status, hired_date, last_login, created_at
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
            if (conditions.length > 0)
                query += ' WHERE ' + conditions.join(' AND ');
            query += ' ORDER BY created_at DESC';
            const [rows] = await connection.execute(query, params);
            connection.release();
            const users = rows.map(row => {
                const nameParts = row['FullName'].trim().split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
                const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';
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
        }
        catch (error) {
            return { success: false, message: 'Failed to fetch users', error: error.message };
        }
    }
    static async getUser(id) {
        try {
            const connection = await database_1.pool.getConnection();
            const [rows] = await connection.execute(`SELECT UserId, FullName, Email, Phone, Roles, Status, hired_date, last_login, created_at FROM Users WHERE UserId = ?`, [id]);
            connection.release();
            if (rows.length === 0)
                return { success: false, message: 'User not found' };
            const u = rows[0];
            const nameParts = u['FullName'].trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
            const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';
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
        }
        catch (error) {
            return { success: false, message: 'Failed to fetch user', error: error.message };
        }
    }
    static async createUser(userData) {
        try {
            const connection = await database_1.pool.getConnection();
            const query = `
        INSERT INTO Users (FullName, Email, Phone, PasswordHash, Roles, Status, hired_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
            const defaultPasswordHash = '$2b$10$defaultHashForNewUsers12345678901234567890123456789';
            const [result] = await connection.execute(query, [
                userData.FullName,
                userData.Email,
                userData.Phone || '',
                defaultPasswordHash,
                userData.Roles,
                userData.Status,
                userData.hired_date || null
            ]);
            connection.release();
            return {
                success: true,
                message: 'User created successfully',
                data: { id: result.insertId, ...userData, created_at: new Date().toISOString() }
            };
        }
        catch (error) {
            return { success: false, message: 'Failed to create user', error: error.message };
        }
    }
    static async updateUser(id, userData) {
        try {
            const connection = await database_1.pool.getConnection();
            const updateFields = [];
            const params = [];
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
            const [result] = await connection.execute(query, params);
            connection.release();
            return {
                success: result.affectedRows > 0,
                message: result.affectedRows > 0 ? 'User updated successfully' : 'No changes made'
            };
        }
        catch (error) {
            return { success: false, message: 'Failed to update user', error: error.message };
        }
    }
    static async deleteUser(id) {
        try {
            const connection = await database_1.pool.getConnection();
            const [result] = await connection.execute(`DELETE FROM Users WHERE UserId = ?`, [id]);
            connection.release();
            return {
                success: result.affectedRows > 0,
                message: result.affectedRows > 0 ? 'User deleted successfully' : 'User not found'
            };
        }
        catch (error) {
            return { success: false, message: 'Failed to delete user', error: error.message };
        }
    }
    static async updateUserLastLogin(id) {
        try {
            const connection = await database_1.pool.getConnection();
            const [result] = await connection.execute(`UPDATE Users SET last_login = CURRENT_TIMESTAMP WHERE UserId = ?`, [id]);
            connection.release();
            return {
                success: result.affectedRows > 0,
                message: result.affectedRows > 0 ? 'Last login updated' : 'User not found'
            };
        }
        catch (error) {
            return { success: false, message: 'Failed to update last login', error: error.message };
        }
    }
    static async healthCheck() {
        try {
            const connection = await database_1.pool.getConnection();
            await connection.execute('SELECT 1 + 1 AS result');
            connection.release();
            return { success: true, message: 'Database connection OK' };
        }
        catch (error) {
            console.error('Database health check failed:', error);
            return {
                success: false,
                message: 'Database connection failed',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    static async updateCanvas(id, canvasData, name) {
        try {
            const connection = await database_1.pool.getConnection();
            const query = `
      UPDATE canvases
      SET canvas_data = ?, name = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
            const [result] = await connection.execute(query, [JSON.stringify(canvasData), name, id]);
            connection.release();
            if (result.affectedRows > 0) {
                return {
                    success: true,
                    message: 'Canvas updated successfully',
                    data: { id: parseInt(id), name, canvas_data: canvasData }
                };
            }
            return { success: false, message: 'Canvas not found' };
        }
        catch (error) {
            console.error('Error updating canvas:', error);
            return { success: false, message: 'Failed to update canvas', error: error.message };
        }
    }
    static async deleteCanvas(id) {
        try {
            const connection = await database_1.pool.getConnection();
            const [result] = await connection.execute(`DELETE FROM canvases WHERE id = ?`, [id]);
            connection.release();
            return {
                success: result.affectedRows > 0,
                message: result.affectedRows > 0
                    ? 'Canvas deleted successfully'
                    : 'Canvas not found'
            };
        }
        catch (error) {
            console.error('Error deleting canvas:', error);
            return { success: false, message: 'Failed to delete canvas', error: error.message };
        }
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=database.service.js.map