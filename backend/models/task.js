const mongoose = require('mongoose');

// Schéma d'une tâche liée à un projet
const taskSchema = new mongoose.Schema({
  title:       { type: String, required: true },         // Titre obligatoire
  description: String,                                    // Description optionnelle
  priority:    { type: String, enum: ['basse','moyenne','haute'], required: true }, // Niveau de priorité
  status:      { type: String, enum: ['à faire','en cours','terminé'], default: 'à faire' }, // État de la tâche
  deadline:    Date,                                      // Date limite optionnelle
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true }, // Projet parent
  assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' }  // Utilisateur assigné (optionnel)
}, { timestamps: true }); // createdAt et updatedAt générés automatiquement

module.exports = mongoose.model('Task', taskSchema);
