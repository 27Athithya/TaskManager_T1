const { Op } = require('sequelize');
const Task = require('../models/Task');

const parseDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    if (!title || !description || !dueDate) {
      return res.status(400).json({
        error: 'All fields are required: title, description, dueDate',
      });
    }

    const parsedDueDate = parseDate(dueDate);
    if (!parsedDueDate) {
      return res.status(400).json({ error: 'Invalid dueDate. Use ISO date-time format.' });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      dueDate: parsedDueDate,
      status: 'pending',
      completedAt: null,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      error: 'Failed to create task',
      message: error.message,
    });
  }
};

// Get tasks. Query:
// status=active|completed|all (default active)
exports.getAllTasks = async (req, res) => {
  try {
    const { status = 'active' } = req.query;
    const where = {};

    if (status === 'active') where.status = 'pending';
    if (status === 'completed') where.status = 'completed';

    const tasks = await Task.findAll({
      where,
      order: [['dueDate', 'ASC']],
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      error: 'Failed to fetch tasks',
      message: error.message,
    });
  }
};

// Get history: completed tasks + overdue pending tasks
exports.getTaskHistory = async (req, res) => {
  try {
    const now = new Date();

    const tasks = await Task.findAll({
      where: {
        [Op.or]: [
          { status: 'completed' },
          {
            [Op.and]: [
              { status: 'pending' },
              { dueDate: { [Op.lt]: now } },
            ],
          },
        ],
      },
      order: [['dueDate', 'DESC']],
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching task history:', error);
    res.status(500).json({
      error: 'Failed to fetch task history',
      message: error.message,
    });
  }
};

// History report payload for sharing/export
exports.getHistoryReport = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [completedCount, overdueCount, completedTodayCount, historyItems] = await Promise.all([
      Task.count({ where: { status: 'completed' } }),
      Task.count({
        where: {
          status: 'pending',
          dueDate: { [Op.lt]: now },
        },
      }),
      Task.count({
        where: {
          status: 'completed',
          completedAt: { [Op.gte]: startOfToday },
        },
      }),
      Task.findAll({
        where: {
          [Op.or]: [
            { status: 'completed' },
            {
              [Op.and]: [
                { status: 'pending' },
                { dueDate: { [Op.lt]: now } },
              ],
            },
          ],
        },
        order: [['dueDate', 'DESC']],
        limit: 100,
      }),
    ]);

    res.status(200).json({
      generatedAt: now.toISOString(),
      summary: {
        totalHistoryItems: historyItems.length,
        completedCount,
        overdueCount,
        completedTodayCount,
      },
      items: historyItems,
    });
  } catch (error) {
    console.error('Error generating history report:', error);
    res.status(500).json({
      error: 'Failed to generate history report',
      message: error.message,
    });
  }
};

// Get a single task by ID
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      error: 'Failed to fetch task',
      message: error.message,
    });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, status } = req.body;

    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();

    if (dueDate !== undefined) {
      const parsedDueDate = parseDate(dueDate);
      if (!parsedDueDate) {
        return res.status(400).json({ error: 'Invalid dueDate. Use ISO date-time format.' });
      }
      task.dueDate = parsedDueDate;
    }

    if (status !== undefined) {
      if (!['pending', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Status must be pending or completed' });
      }
      task.status = status;
      task.completedAt = status === 'completed' ? new Date() : null;
    }

    await task.save();

    res.status(200).json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      error: 'Failed to update task',
      message: error.message,
    });
  }
};

// Mark task as completed
exports.completeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.status = 'completed';
    task.completedAt = new Date();
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({
      error: 'Failed to complete task',
      message: error.message,
    });
  }
};

// Reopen completed task
exports.reopenTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.status = 'pending';
    task.completedAt = null;
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    console.error('Error reopening task:', error);
    res.status(500).json({
      error: 'Failed to reopen task',
      message: error.message,
    });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await task.destroy();

    res.status(200).json({ message: 'Task deleted successfully', id: Number(id) });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      error: 'Failed to delete task',
      message: error.message,
    });
  }
};
