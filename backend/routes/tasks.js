const router = require('express').Router();
const auth   = require('../middlewares/auth');
const Task   = require('../models/Task');

// GET tâches d'un projet spécifique
router.get('/projects/:id/tasks', auth, async (req, res) => {
  const tasks = await Task.find({ project: req.params.id }); // Filtre par ID du projet
  res.json(tasks);
});

// POST créer une nouvelle tâche
router.post('/tasks', auth, async (req, res) => {
  const task = await Task.create(req.body); // Création à partir du corps de la requête
  res.status(201).json(task);
});

// PUT modifier entièrement une tâche existante
router.put('/tasks/:id', auth, async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true }); // Retourne le document mis à jour
  res.json(task);
});

// PATCH mettre à jour uniquement le statut d'une tâche
router.patch('/tasks/:id/status', auth, async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true } // Validation de l'enum status
  );
  res.json(task);
});

// DELETE supprimer une tâche par son ID
router.delete('/tasks/:id', auth, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: 'Tâche supprimée' });
});

module.exports = router;
