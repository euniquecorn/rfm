"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_service_1 = require("../services/database.service");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const { role, status } = req.query;
        const result = await database_service_1.DatabaseService.getUsers(role, status);
        if (result.success) {
            return res.json(result);
        }
        else {
            return res.status(500).json(result);
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'Valid user ID is required'
            });
        }
        const result = await database_service_1.DatabaseService.getUser(id);
        if (result.success) {
            return res.json(result);
        }
        else {
            return res.status(404).json(result);
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, roles, status, hiredDate } = req.body;
        if (!firstName || !lastName || !email || !roles) {
            return res.status(400).json({
                success: false,
                message: 'First name, last name, email, and roles are required'
            });
        }
        const result = await database_service_1.DatabaseService.createUser({
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
        }
        else {
            return res.status(400).json(result);
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to create user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, phone, roles, status, hiredDate } = req.body;
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'Valid user ID is required'
            });
        }
        const result = await database_service_1.DatabaseService.updateUser(id, {
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
        }
        else {
            return res.status(404).json(result);
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'Valid user ID is required'
            });
        }
        const result = await database_service_1.DatabaseService.deleteUser(id);
        if (result.success) {
            return res.json(result);
        }
        else {
            return res.status(404).json(result);
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.patch('/:id/login', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'Valid user ID is required'
            });
        }
        const result = await database_service_1.DatabaseService.updateUserLastLogin(id);
        if (result.success) {
            return res.json(result);
        }
        else {
            return res.status(404).json(result);
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to update user login',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=users.routes.js.map