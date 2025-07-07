import express from "express"
import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"

import { verifyUser, adminOnly } from "../Middlewares/authcheck.middleware.js"

import User from "../Models/User.js"
import Question from "../Models/Question.js"
import Answer from "../Models/Answer.js"

import mongoose from "mongoose"

const router = express.Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads"))
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-profilePicture${path.extname(file.originalname)}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    )
    const mimetype = filetypes.test(file.mimetype)
    if (extname && mimetype) {
      cb(null, true)
    } else {
      cb(new Error("Images only (jpeg, jpg, png)!"))
    }
  },
})

// GET /api/user - List all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find(
      {},
      "firstname lastname picture bio createdAt"
    ).lean()
    res.status(200).json(users)
  } catch (err) {
    console.error("GET /api/user error:", err.message)
    res.status(500).json({ message: "Error fetching users" })
  }
})

// GET /api/user/:id
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json(user)
  } catch (err) {
    console.error("GET /api/user/:id error:", err.message)
    res.status(500).json({ message: "Error fetching user " })
  }
})

// POST /api/user/profile - Update user profile
router.post(
  "/profile",
  verifyUser,
  upload.single("picture"),
  async (req, res) => {
    try {
      const { firstname, lastname, bio, expertise, username } = req.body
      const updateData = {
        firstname: firstname || req.user.firstname,
        lastname: lastname || req.user.lastname,
        bio: bio || req.user.bio || "",
        interests: interests ? JSON.parse(interests) : req.user.interests || [],
      }

      if (req.file) {
        updateData.picture = `/uploads/${req.file.filename}`
      }

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select("firstname lastname username picture bio expertise createdAt")

      res.status(200).json(user)
    } catch (err) {
      console.error("POST /api/user/profile error:", err.message)
      res
        .status(500)
        .json({ message: `Error updating profile: ${err.message}` })
    }
  }
)

export default router
