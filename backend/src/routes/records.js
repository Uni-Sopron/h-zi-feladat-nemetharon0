import { Router } from 'express'
import auth from '../middleware/auth.js'
import Record from '../models/Record.js'
import Account from '../models/Account.js'

const router = Router()
router.use(auth)

// GET /api/records
router.get('/', async (req, res) => {
  const records = await Record.find({ userId: req.user.id }).sort({ date: -1 })
  res.json(records)
})

// POST /api/records
router.post('/', async (req, res) => {
  try {
    const record = await Record.create({ ...req.body, userId: req.user.id })
    // balance frissítése
    const delta = record.type === 'income' ? record.amount : -record.amount
    await Account.findOneAndUpdate(
      { _id: record.accountId, userId: req.user.id },
      { $inc: { balance: delta } }
    )
    res.status(201).json(record)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PUT /api/records/:id
router.put('/:id', async (req, res) => {
  try {
    const old = await Record.findOne({ _id: req.params.id, userId: req.user.id })
    if (!old) return res.status(404).json({ message: 'Nem található' })

    // visszaállítjuk a balance-t az előző érték alapján
    const revert = old.type === 'income' ? -old.amount : old.amount
    await Account.findOneAndUpdate(
      { _id: old.accountId, userId: req.user.id },
      { $inc: { balance: revert } }
    )

    const updated = await Record.findByIdAndUpdate(req.params.id, req.body, { new: true })

    // alkalmazzuk az újat
    const delta = updated.type === 'income' ? updated.amount : -updated.amount
    await Account.findOneAndUpdate(
      { _id: updated.accountId, userId: req.user.id },
      { $inc: { balance: delta } }
    )

    res.json(updated)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// DELETE /api/records/:id
router.delete('/:id', async (req, res) => {
  try {
    const record = await Record.findOneAndDelete({ _id: req.params.id, userId: req.user.id })
    if (!record) return res.status(404).json({ message: 'Nem található' })

    // balance visszaállítás
    const revert = record.type === 'income' ? -record.amount : record.amount
    await Account.findOneAndUpdate(
      { _id: record.accountId, userId: req.user.id },
      { $inc: { balance: revert } }
    )
    res.json({ message: 'Törölve' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router