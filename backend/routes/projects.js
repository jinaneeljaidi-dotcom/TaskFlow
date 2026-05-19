// Project CRUD routes — paginated list, create, update, delete with cascade

const router = require('express').Router();
const auth = require('../middleware/auth');
const { validateProject } = require('../middleware/validate');
const Project = require('../models/Project');
const Activity = require('../models/Activity');
const User = require('../models/User');
const Notification = require('../models/Notification');

// GET /api/projects?page=1&limit=10
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = {
      $or: [{ owner: req.user.id }, { members: req.user.id }],
    };
    const total = await Project.countDocuments(filter);
    const data = await Project.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });
    res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

 
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('owner members', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/projects
router.post('/', auth, validateProject, async (req, res) => {
  try {
    const { title, description, deadline, status } = req.body;
    const project = await Project.create({ title, description, deadline, status, owner: req.user.id });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/projects/:id — owner only
router.put('/:id', auth, validateProject, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user.id)
      return res.status(403).json({ message: 'Only the owner can edit this project' });
    const { title, description, deadline, status } = req.body;
    Object.assign(project, { title, description, deadline, status });
    await project.save();
    await Activity.create({ project: project._id, user: req.user.id, action: 'modified project', detail: title });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/projects/:id — owner only, triggers cascade via pre('deleteOne')
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user.id)
      return res.status(403).json({ message: 'Only the owner can delete this project' });
    await project.deleteOne(); // triggers pre hook for cascade
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/projects/:id/members — invite by email (owner only)
router.post('/:id/members', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user.id)
      return res.status(403).json({ message: 'Only the owner can invite members' });
    const { email } = req.body;
    const invitee = await User.findOne({ email });
    if (!invitee) return res.status(404).json({ message: 'No user with that email' });
    if (project.members.includes(invitee._id.toString()))
      return res.status(409).json({ message: 'User is already a member' });
    project.members.push(invitee._id);
    await project.save();
    await Notification.create({ user: invitee._id, message: `You were added to project "${project.title}"`, project: project._id });
    await Activity.create({ project: project._id, user: req.user.id, action: 'added member', detail: invitee.name });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/projects/:id/members/:userId — remove member (owner only)
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user.id)
      return res.status(403).json({ message: 'Only the owner can remove members' });
    project.members = project.members.filter(m => m.toString() !== req.params.userId);
    await project.save();
    await Activity.create({ project: project._id, user: req.user.id, action: 'removed member', detail: req.params.userId });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/projects/:id/activities
router.get('/:id/activities', auth, async (req, res) => {
  try {
    const activities = await require('../models/Activity')
      .find({ project: req.params.id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
