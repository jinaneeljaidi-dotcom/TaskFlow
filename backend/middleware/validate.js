// Request body validation middleware — checks required fields and enum values

const VALID_PRIORITY = ['basse', 'moyenne', 'haute'];
const VALID_STATUS_TASK = ['à faire', 'en cours', 'terminé'];
const VALID_STATUS_PROJECT = ['actif', 'en pause', 'archivé'];

exports.validateTask = (req, res, next) => {
  const { title, priority, status } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });
  if (priority && !VALID_PRIORITY.includes(priority))
    return res.status(400).json({ message: `Priority must be one of: ${VALID_PRIORITY.join(', ')}` });
  if (status && !VALID_STATUS_TASK.includes(status))
    return res.status(400).json({ message: `Status must be one of: ${VALID_STATUS_TASK.join(', ')}` });
  next();
};

exports.validateProject = (req, res, next) => {
  const { title, status } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });
  if (status && !VALID_STATUS_PROJECT.includes(status))
    return res.status(400).json({ message: `Status must be one of: ${VALID_STATUS_PROJECT.join(', ')}` });
  next();
};
