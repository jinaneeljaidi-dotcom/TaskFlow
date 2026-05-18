const router = require('express').Router();
const auth   = require('../middlewares/auth');
const Task   = require('../models/Task');

// GET tâches d'un projet
router.get('/projects/:id/tasks', auth, async (req, res) => {
  const tasks = await Task.find({ project: req.params.id });
  res.json(tasks);
});

// POST créer une tâche
router.post('/tasks', auth, async (req, res) => {
  const task = await Task.create(req.body);
  res.status(201).json(task);
});

// PUT modifier une tâche
router.put('/tasks/:id', auth, async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(task);
});

// PATCH mettre à jour le statut uniquement
router.patch('/tasks/:id/status', auth, async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  res.json(task);
});

// DELETE supprimer une tâche
router.delete('/tasks/:id', auth, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: 'Tâche supprimée' });
});

module.exports = router;