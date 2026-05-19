const router = require('express').Router();
const auth   = require('../middlewares/auth');
const Notif  = require('../models/Notification');

// GET mes notifications
router.get('/', auth, async (req, res) => {
  const notifs = await Notif.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(notifs);
});

// PATCH marquer comme lue
router.patch('/:id/read', auth, async (req, res) => {
  await Notif.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ message: 'Notification lue' });
});

module.exports = router;


let notifications = [];

async function fetchNotifications() {
  const { data } = await axios.get('/api/notifications');
  notifications = data;
  const unread = data.filter(n => !n.read).length;
  document.getElementById('notif-badge').textContent = unread || '';

  // Archiver les lues dans localStorage
  const read = data.filter(n => n.read);
  localStorage.setItem('read_notifs', JSON.stringify(read));
}

async function markAsRead(id) {
  await axios.patch(`/api/notifications/${id}/read`);
  fetchNotifications(); // met à jour le badge
}

// Polling toutes les 30 secondes
fetchNotifications();
setInterval(fetchNotifications, 30000);