const express = require('express')
const router = express.Router()
const Project = require('../models/Project')
const User = require('../models/User')
const auth = require('../middleware/auth')

router.post('/:id/invite', auth, async (req, res) => {
  try {
    const projet = await Project.findOne({ _id: req.params.id, createur: req.user.id })
    if (!projet) return res.status(403).json({ message: 'Accès refusé' })

    const userAInviter = await User.findOne({ email: req.body.email })
    if (!userAInviter) return res.status(404).json({ message: 'Utilisateur introuvable' })

    if (projet.membres.includes(userAInviter._id))
      return res.status(400).json({ message: 'Déjà membre' })

    projet.membres.push(userAInviter._id)
    await projet.save()
    res.json({ message: 'Membre ajouté avec succès' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const projet = await Project.findOne({ _id: req.params.id, createur: req.user.id })
    if (!projet) return res.status(403).json({ message: 'Accès refusé' })

    projet.membres = projet.membres.filter(m => m.toString() !== req.params.userId)
    await projet.save()
    res.json({ message: 'Membre retiré' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router