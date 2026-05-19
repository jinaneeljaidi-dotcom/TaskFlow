const Project = require('../models/Project');

module.exports = async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Projet introuvable' });
  if (project.owner.toString() !== req.user._id.toString())
    return res.status(403).json({ error: 'Accès réservé au créateur' });
  req.project = project;
  next();
};s