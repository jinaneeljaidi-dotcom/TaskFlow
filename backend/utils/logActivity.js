const Activity = require('../models/Activity');

module.exports = async (action, projectId, userId, details = '') => {
  await Activity.create({ action, project: projectId, user: userId, details });
};s