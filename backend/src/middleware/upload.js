import multer from 'multer'
import path from 'path'
import fs from 'fs'

const uploadDir = 'uploads'
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir)

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${req.user._id}-${Date.now()}${ext}`)
  }
})

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Csak kép vagy PDF tölthető fel'))
}

export default multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } })