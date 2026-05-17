const express = require('express');
const router = express.Router();

const Task = require('../models/Task');
const auth = require('../middleware/auth');

// GET toutes les tâches d'un projet
router.get('/projects/:id/tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.id })
      .populate('assignedTo', 'nom email'); // projection

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST créer une tâche
router.post('/tasks', auth, async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT modifier une tâche
router.put('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE supprimer une tâche
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tâche supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH changer le statut
router.patch('/tasks/:id/status', auth, async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

// Remplace Task.find(...) par :
Task.find({ projectId: req.params.id })
  .populate('assignedTo', 'nom email')
// 'nom email' = projection : on ne retourne QUE ces deux champs

const tasks = await Task.find({
  projectId: req.params.id,
  assignedTo: req.user.id
}).populate('assignedTo', 'nom email');
router.get('/projects/:id/members', async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('members', 'nom email');

  res.json(project.members);
});

router.get('/projects/:id/tasks', auth, async (req, res) => {
  const { statut, priorite, assignedTo, search, page=1, limit=10 } = req.query;

  // Filtre de base : les tâches du projet
  const filter = { projectId: req.params.id };

  // On ajoute une condition SEULEMENT si le paramètre est présent
  if (statut)     filter.statut = statut;
  if (priorite)   filter.priorite = priorite;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (search) {
    filter.$or = [
      { titre:       { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const total = await Task.countDocuments(filter);
  const tasks = await Task.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({
    data: tasks,
    total,

    page: Number(page),
    totalPages: Math.ceil(total / limit)
  });
});


