import express from "express"

import {
  verifyUser,
  adminOnly,
  authorizeRoles,
} from "../Middlewares/authcheck.middleware.js"

import User from "../Models/User.js"
import Question from "../Models/Question.js"
import Answer from "../Models/Answer.js"

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

// Handle path for ES6 modules
const __filename = fileURLToPath(import.meta.url)
// get path of the file
const __dirname = path.dirname(__filename)

const router = express.Router()

// --------------------- GET Pending Users -------------------------------

router.get("/pending", verifyUser, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ isApproved: false })
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ---------------------PUT Approve Users -------------------------------

router.put(
  "/approve/:userId",
  verifyUser,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.userId)
      if (!user) return res.status(404).json({ message: "User not found" })

      user.isApproved = true

      const idCardImage = user.idCardImage
      user.idCardImage = "accepted and removed"
      await user.save()

      if (idCardImage) {
        const imagePath = path.join(__dirname, "../", idCardImage)
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error("Error deleting image:", err)
          } else {
            console.log("Image deleted successfully:", imagePath)
          }
        })
      }

      res.json({ message: "User approved and image deleted (if found)" })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }
)

// ---------------------DELETE Reject User -------------------------------

router.delete("/reject/:userId", verifyUser, adminOnly, async (req, res) => {
  try {
    const userId = req.params.userId
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const idCardImage = user.idCardImage

    await User.findByIdAndDelete(userId)

    if (idCardImage) {
      const imagePath = path.join(__dirname, "../", idCardImage)
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Error deleting image:", err)
        } else {
          console.log("Image deleted successfully:", imagePath)
        }
      })
    }

    res.json({ message: "User rejected and image deleted (if found)" })
  } catch (err) {
    console.error("Error rejecting user:", err)
    res.status(500).json({ message: err.message })
  }
})

// Admin routes

// ---------------------DELETE Delete User -------------------------------

router.delete(
  "/user/:id",
  verifyUser,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id)
      res.status(200).json({ message: "User deleted successfully." })
    } catch (error) {
      console.error("Delete User Error:", error)
      res.status(500).json({ message: "Server error while deleting user." })
    }
  }
)

// ---------------------PUT Update User -------------------------------

router.put("/user/:id", verifyUser, adminOnly, async (req, res) => {
  try {
    const { id } = req.params
    const { username, email, interests, isApproved } = req.body

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username, email, interests, isApproved },
      { new: true }
    )

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." })
    }

    res.status(200).json({ message: "User updated successfully.", updatedUser })
  } catch (error) {
    console.error("Update User Error:", error)
    res.status(500).json({ message: "Server error while updating user." })
  }
})

// ---------------------DELETE Delete Question -------------------------------

router.delete(
  "/question/:id",
  verifyUser,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      // Find and delete the question by ID
      await Question.findByIdAndDelete(req.params.id)
      res.status(200).json({ message: "Question deleted successfully." })
    } catch (error) {
      console.error("Delete Question Error:", error)
      res.status(500).json({ message: "Server error while deleting question." })
    }
  }
)

// ---------------------DELETE Delete Answer -------------------------------
router.delete("/answer/:id", verifyUser, adminOnly, async (req, res) => {
  try {
    // Find and delete the answer by ID
    await Answer.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: "Answer deleted successfully." })
  } catch (error) {
    console.error("Delete Answer Error:", error)
    res.status(500).json({ message: "Server error while deleting answer." })
  }
})

// GET /api/admin/users - List all users for admin
router.get("/users", verifyUser, adminOnly, async (req, res) => {
  try {
    const users = await User.find(
      {},
      "firstname lastname email isBlocked isAdmin"
    ).lean()
    res.status(200).json(users)
  } catch (err) {
    console.error("GET /api/admin/users error:", err.message)
    res.status(500).json({ message: "Error fetching users" })
  }
})

// PUT /api/admin/block/:id - Block a user
router.put("/block/:id", verifyUser, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    if (user.isAdmin) {
      return res.status(403).json({ message: "Cannot block an admin" })
    }
    user.isBlocked = true
    await user.save()
    res.status(200).json({ message: "User blocked successfully" })
  } catch (err) {
    console.error("PUT /api/admin/block/:id error:", err.message)
    res.status(500).json({ message: "Error blocking user" })
  }
})

// PUT /api/admin/unblock/:id - Unblock a user
router.put("/unblock/:id", verifyUser, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    user.isBlocked = false
    await user.save()
    res.status(200).json({ message: "User unblocked successfully" })
  } catch (err) {
    console.error("PUT /api/admin/unblock/:id error:", err.message)
    res.status(500).json({ message: "Error unblocking user" })
  }
})

export default router
