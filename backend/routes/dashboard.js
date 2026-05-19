// Dashboard aggregation route — returns personal metrics using MongoDB pipeline

const router = require('express').Router();
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Task = require('../models/Task');

router.get('/', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Count active projects where user is owner or member
    const activeProjects = await Project.countDocuments({
      $or: [{ owner: userId }, { members: userId }],
      status: 'actif',
    });

    // Aggregation for task stats
    const taskStats = await Task.aggregate([
      { $match: { assignedTo: userId } },
      {
        $group: {
          _id: null,
          total: { $count: {} },
          done: { $sum: { $cond: [{ $eq: ['$status', 'terminé'] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                { $and: [{ $lt: ['$deadline', new Date()] }, { $ne: ['$status', 'terminé'] }] },
                1, 0,
              ],
            },
          },
        },
      },
    ]);

    const stats = taskStats[0] || { total: 0, done: 0, overdue: 0 };

    // In-progress tasks sorted by priority desc, deadline asc
    const inProgress = await Task.find({ assignedTo: userId, status: 'en cours' })
      .populate('project', 'title')
      .sort({ priority: -1, deadline: 1 })
      .limit(10);

    res.json({
      activeProjects,
      assignedTasks: stats.total,
      doneTasks: stats.done,
      overdueTasks: stats.overdue,
      inProgress,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
