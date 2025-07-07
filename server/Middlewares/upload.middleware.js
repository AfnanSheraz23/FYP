import multer from "multer"
import path from "path"
import fs from "fs"

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadPath = "uploads/"
    fs.mkdirSync(uploadPath, { recursive: true })
    cb(null, uploadPath)
  },
  filename(req, file, cb) {
    cb(null, `id-${Date.now()}${path.extname(file.originalname)}`)
  },
})

export const upload = multer({ storage })
