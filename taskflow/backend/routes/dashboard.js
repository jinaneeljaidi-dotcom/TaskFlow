const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

router.get('/dashboard', auth, async (req, res) => {
  const userId = req.user.id;
  const now = new Date();

  // Projets actifs de l'utilisateur
  const projetsActifs = await Project.countDocuments({
    owner: userId,
    statut: 'actif'
  });

  // Tâches assignées à l'utilisateur
  const tachesAssignees = await Task.countDocuments({
    assignedTo: userId
  });

  // Tâches terminées
  const tachesTerminees = await Task.countDocuments({
    assignedTo: userId,
    statut: 'termine'
  });

  // Tâches en retard (date dépassée ET pas terminé)
  const tachesEnRetard = await Task.countDocuments({
    assignedTo: userId,
    dateLimite: { $lt: now },
    statut: { $ne: 'termine' }
  });

  // Tâches en cours triées : priorité décroissante, date croissante
  const tachesEnCours = await Task.find({
    assignedTo: userId,
    statut: 'en cours'
  }).sort({ priorite: -1, dateLimite: 1 });

  res.json({
    projetsActifs,
    tachesAssignees,
    tachesTerminees,
    tachesEnRetard,
    tachesEnCours
  });
});

module.exports = router;

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const token = localStorage.getItem('token');

    const res = await axios.get('/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = res.data;

    document.getElementById('projets-actifs').textContent = data.projetsActifs;
    document.getElementById('taches-assignees').textContent = data.tachesAssignees;
    document.getElementById('taches-terminees').textContent = data.tachesTerminees;
    document.getElementById('taches-retard').textContent = data.tachesEnRetard;

  } catch (err) {
    console.error("Erreur dashboard:", err);
  }
});


