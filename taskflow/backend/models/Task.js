const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String },
  priorite: {
    type: String,
    enum: ['basse', 'moyenne', 'haute'],
    required: true
  },
  statut: {
    type: String,
    enum: ['a faire', 'en cours', 'termine'],
    default: 'a faire'
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  dateLimite: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
