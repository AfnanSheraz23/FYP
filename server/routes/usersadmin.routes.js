import express from "express"
import { adminOnly } from "../Middlewares/authcheck.middleware.js"
import User from "../Models/User.js"

const router = express.Router()

// GET /api/admin/users - List all users for admin
router.get("/users", adminOnly, async (req, res) => {
  try {
    const users = await User.find(
      {},
      "firstname lastname isBlocked isAdmin"
    ).lean()
    res.status(200).json(users)
  } catch (err) {
    console.error("GET /api/admin/users error:", err.message)
    res.status(500).json({ message: "Error fetching users" })
  }
})

// PUT /api/admin/block/:id - Block a user
router.put("/block/:id", adminOnly, async (req, res) => {
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
router.put("/unblock/:id", adminOnly, async (req, res) => {
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
