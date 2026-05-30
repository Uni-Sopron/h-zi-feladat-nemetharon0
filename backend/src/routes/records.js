import { Router } from 'express'
import fs from 'fs/promises'
import path from 'path'
import auth from '../middleware/auth.js'
import Record from '../models/Record.js'
import Account from '../models/Account.js'
import upload from '../middleware/upload.js'

const router = Router()
router.use(auth)

// seg. függvény: fájl törlése a lemezről, ha létezik
const deleteFile = async (filename) => {
  if (!filename) return
  try {
    await fs.unlink(path.join(process.cwd(), 'uploads', filename))
  } catch (err) {
    console.error('Hiba a fájl törlésekor:', err)
  }
}

// seg. függvény: számla egyenlegének módosítása
const adjustBalance = async (accountId, userId, amount, type) => {
  const delta = type === 'income' ? amount : -amount
  await Account.findOneAndUpdate(
    { _id: accountId, userId },
    { $inc: { balance: delta } }
  )
}

// GET /api/records
router.get('/', async (req, res) => {
  try {
    const records = await Record.find({ userId: req.user.id }).sort({ date: -1 })
    res.json(records)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/records
router.post('/', async (req, res) => {
  try {
    const record = await Record.create({ ...req.body, userId: req.user.id })
    await adjustBalance(record.accountId, req.user.id, record.amount, record.type)
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

    // Régi balance hatás visszavonása
    const inverseType = old.type === 'income' ? 'expense' : 'income'
    await adjustBalance(old.accountId, req.user.id, old.amount, inverseType)

    // Ha az attachment null-ra van állítva, töröljük a régi fájlt
    if ('attachment' in req.body && req.body.attachment === null) {
      await deleteFile(old.attachment)
    }

    const updated = await Record.findByIdAndUpdate(req.params.id, req.body, { new: true })
    await adjustBalance(updated.accountId, req.user.id, updated.amount, updated.type)

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

    await deleteFile(record.attachment)

    const inverseType = record.type === 'income' ? 'expense' : 'income'
    await adjustBalance(record.accountId, req.user.id, record.amount, inverseType)

    res.json({ message: 'Törölve' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/records/:id/attachment
router.post('/:id/attachment', upload.single('file'), async (req, res) => {
  try {
    const old = await Record.findOne({ _id: req.params.id, userId: req.user.id })
    if (!old) return res.status(404).json({ message: 'Nem található' })

    // Régi csatolmány törlése ha volt
    await deleteFile(old.attachment)

    const record = await Record.findByIdAndUpdate(
      req.params.id,
      { attachment: req.file.filename },
      { new: true }
    )
    res.json(record)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/records/:id/attachment
router.get('/:id/attachment', async (req, res) => {
  try {
    const record = await Record.findOne({ _id: req.params.id, userId: req.user.id })
    if (!record?.attachment) return res.status(404).json({ message: 'Nincs csatolmány' })
    res.sendFile(record.attachment, { root: 'uploads' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router