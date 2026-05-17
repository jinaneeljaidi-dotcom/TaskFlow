const router  = require('express').Router();
const auth    = require('../middlewares/auth');
const isOwner = require('../middlewares/isOwner');
const User    = require('../models/User');

 
router.post('/:id/members', auth, isOwner, async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  req.project.members.addToSet(user._id);
  await req.project.save();
  res.json({ message: 'Membre ajouté' });
});

 
router.delete('/:id/members/:userId', auth, isOwner, async (req, res) => {
  req.project.members.pull(req.params.userId);
  await req.project.save();
  res.json({ message: 'Membre retiré' });
});

module.exports = router;