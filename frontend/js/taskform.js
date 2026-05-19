const router = require('express').Router();
const auth = require('../middlewares/auth');
const Task = require('../models/Task');

// GET tâches d'un projet spécifique
router.get('/projects/:id/tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({
      message: 'Erreur serveur',
      error: err.message
    });
  }
});

// POST créer une nouvelle tâche
router.post('/tasks', auth, async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (err) {
    const status = err.name === 'ValidationError' ? 400 : 500;

    res.status(status).json({
      message: 'Erreur lors de la création',
      error: err.message
    });
  }
});

// PUT modifier entièrement une tâche
router.put('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!task) {
      return res.status(404).json({
        message: 'Tâche introuvable'
      });
    }

    res.json(task);
  } catch (err) {
    const status = err.name === 'ValidationError' ? 400 : 500;

    res.status(status).json({
      message: 'Erreur lors de la mise à jour',
      error: err.message
    });
  }
});

// PATCH mettre à jour uniquement le statut
router.patch('/tasks/:id/status', auth, async (req, res) => {
  try {
    if (!req.body.status) {
      return res.status(400).json({
        message: 'Le champ "status" est requis'
      });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      {
        new: true,
        runValidators: true
      }
    );

    if (!task) {
      return res.status(404).json({
        message: 'Tâche introuvable'
      });
    }

    res.json(task);
  } catch (err) {
    const status = err.name === 'ValidationError' ? 400 : 500;

    res.status(status).json({
      message: 'Erreur lors de la mise à jour du statut',
      error: err.message
    });
  }
});

// DELETE supprimer une tâche
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: 'Tâche introuvable'
      });
    }

    res.json({
      message: 'Tâche supprimée'
    });
  } catch (err) {
    res.status(500).json({
      message: 'Erreur lors de la suppression',
      error: err.message
    });
  }
});

module.exports = router;