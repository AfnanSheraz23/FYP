import express from "express"
import ChatModel from "../Models/chatModel.js"

const router = express.Router()

// Create a new chat
router.post("/", async (req, res) => {
  const newChat = new ChatModel({
    members: [req.body.senderId, req.body.receiverId],
  })
  try {
    const result = await newChat.save()
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json(error)
  }
})

// Get chats for a user, excluding those they deleted
router.get("/:userId", async (req, res) => {
  try {
    const chat = await ChatModel.find({
      members: { $in: [req.params.userId] },
    })
    res.status(200).json(chat)
  } catch (error) {
    res.status(500).json(error)
  }
})

// Find a specific chat between two users
router.get("/find/:firstId/:secondId", async (req, res) => {
  try {
    const chat = await ChatModel.findOne({
      members: { $all: [req.params.firstId, req.params.secondId] },
    })
    res.status(200).json(chat)
  } catch (error) {
    res.status(500).json(error)
  }
})

export default router
