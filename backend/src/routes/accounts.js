import { Router } from 'express'
import auth from '../middleware/auth.js'
import Account from '../models/Account.js'
import Record from '../models/Record.js'

const router = Router()
router.use(auth)

// GET /api/accounts
router.get('/', async (req, res) => {
  const accounts = await Account.find({ userId: req.user.id })
  res.json(accounts)
})

// POST /api/accounts
router.post('/', async (req, res) => {
  try {
    const account = await Account.create({ ...req.body, userId: req.user.id })
    res.status(201).json(account)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PUT /api/accounts/:id
router.put('/:id', async (req, res) => {
  try {
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    )
    if (!account) return res.status(404).json({ message: 'Nem található' })
    res.json(account)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// DELETE /api/accounts/:id
router.delete('/:id', async (req, res) => {
  try {
    const account = await Account.findOneAndDelete({ _id: req.params.id, userId: req.user.id })
    if (!account) return res.status(404).json({ message: 'Nem található' })
    // töröljük a hozzá tartozó recordokat is
    await Record.deleteMany({ accountId: req.params.id, userId: req.user.id })
    res.json({ message: 'Törölve' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router