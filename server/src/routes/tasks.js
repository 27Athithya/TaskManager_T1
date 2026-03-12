const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// POST /api/tasks - Create a new task
router.post('/', taskController.createTask);

// GET /api/tasks - Get all tasks
router.get('/', taskController.getAllTasks);

// GET /api/tasks/history - Get history tasks (completed + overdue)
router.get('/history', taskController.getTaskHistory);

// GET /api/tasks/history/report - Generate report payload from history
router.get('/history/report', taskController.getHistoryReport);

// GET /api/tasks/:id - Get a single task
router.get('/:id', taskController.getTaskById);

// PUT /api/tasks/:id - Update a task
router.put('/:id', taskController.updateTask);

// PATCH /api/tasks/:id/complete - Mark task completed
router.patch('/:id/complete', taskController.completeTask);

// PATCH /api/tasks/:id/reopen - Reopen task
router.patch('/:id/reopen', taskController.reopenTask);

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', taskController.deleteTask);

module.exports = router;
