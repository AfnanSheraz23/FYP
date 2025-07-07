import express from "express"
import MessageModel from "../Models/messageModel.js"
import ChatModel from "../Models/ChatModel.js"
import User from "../Models/User.js"
import { verifyUser } from "../Middlewares/authcheck.middleware.js"

import pb from "../utils/pocketBaseClient.js"

const router = express.Router()

// router.post("/", verifyUser, async (req, res) => {
//   const { chatId, senderId, text } = req.body
//   const message = new MessageModel({
//     chatId,
//     senderId,
//     text,
//   })
//   try {
//     const result = await message.save()
//     res.status(200).json(result)
//   } catch (error) {
//     res.status(500).json(error)
//   }
// })
router.post("/", verifyUser, async (req, res) => {
  const { chatId, senderId, text } = req.body

  const message = new MessageModel({
    chatId,
    senderId,
    text,
  })

  try {
    // Save the message
    const result = await message.save()

    // Fetch chat to get participants
    const chat = await ChatModel.findById(chatId)
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" })
    }

    // Determine recipient (the other user in the chat)
    const recipientId = chat.members.find(
      (userId) => String(userId) !== String(senderId)
    )
    if (!recipientId) {
      return res.status(400).json({ error: "No recipient found in chat" })
    }

    // Fetch sender's details for notification content
    const sender = await User.findById(senderId)
    if (!sender) {
      return res.status(404).json({ error: "Sender not found" })
    }

    // Fetch recipient to ensure they exist
    const recipient = await User.findById(recipientId)
    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" })
    }

    // Send notification to recipient
    await pb.collection("notifications").create({
      userId: recipientId,
      type: "message",
      chatId: chatId,
      content: `${sender.firstname} sent you a message.`,
      read: false,
      link: `?chatId=${chatId}`,
    })

    res.status(200).json(result)
  } catch (error) {
    console.error("Error in message route:", error)
    res.status(500).json(error)
  }
})
router.get("/:chatId", verifyUser, async (req, res) => {
  const { chatId } = req.params
  try {
    const result = await MessageModel.find({ chatId })
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json(error)
  }
})

export default router
