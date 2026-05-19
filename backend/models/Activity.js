// Mongoose schema for activity log — records significant events on a project

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g. "created task", "changed status"
  detail: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
