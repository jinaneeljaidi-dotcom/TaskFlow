const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// GET toutes les tâches d'un projet
router.get('/projects/:id/tasks', auth, async (req, res) => {
  const tasks = await Task.find({ projectId: req.params.id });
  res.json(tasks);
});

// POST créer une tâche
router.post('/tasks', auth, async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  res.status(201).json(task);
});

// PUT modifier une tâche
router.put('/tasks/:id', auth, async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id, req.body, { new: true }
  );
  res.json(task);
});

// DELETE supprimer une tâche
router.delete('/tasks/:id', auth, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: 'Tâche supprimée' });
});

module.exports = router;
// PATCH mettre à jour uniquement le statut
router.patch('/tasks/:id/status', auth, async (req, res) => {
  const { statut } = req.body;
  const allowed = ['a faire', 'en cours', 'termine'];
  if (!allowed.includes(statut)) {
    return res.status(400).json({ error: 'Statut invalide' });
  }
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { statut },
    { new: true }
  );
  res.json(task);
});

