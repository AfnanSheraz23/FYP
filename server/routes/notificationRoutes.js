import express from "express"

const router = express.Router()

import Notification from "../Models/Notification.js"
import { verifyUser } from "../Middlewares/authcheck.middleware.js"

// Get notifications for the authenticated user
router.get("/", verifyUser, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("sender", "firstname lastname picture")
      .sort({ createdAt: -1 })
      .exec()
    res.status(200).json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    res.status(500).json({ message: "Failed to fetch notifications" })
  }
})

// Mark notification as read
router.patch("/:id/read", verifyUser, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    })
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }
    notification.isRead = true
    await notification.save()
    res.status(200).json({ message: "Notification marked as read" })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    res.status(500).json({ message: "Failed to mark notification as read" })
  }
})

export default router
