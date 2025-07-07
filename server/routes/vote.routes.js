import express from "express"

import { verifyUser } from "../Middlewares/authcheck.middleware.js"

import Vote from "../Models/Vote.js"
import Question from "../Models/Question.js"
import Answer from "../Models/Answer.js"

import pb from "../utils/pocketBaseClient.js"

const router = express.Router()

// POST /api/votes - Create or update a vote
router.post("/", verifyUser, async (req, res) => {
  const { targetId, targetType, voteType } = req.body
  const userId = req.user.id

  if (!["question", "answer"].includes(targetType)) {
    return res.status(400).json({ message: "Invalid targetType" })
  }
  if (!["upvote", "downvote"].includes(voteType)) {
    return res.status(400).json({ message: "Invalid voteType" })
  }

  try {
    const TargetModel = targetType === "question" ? Question : Answer

    // Check if the target exists and get its user
    const target = await TargetModel.findById(targetId)
    if (!target) {
      return res.status(404).json({ message: `${targetType} not found` })
    }

    // Prevent voting on own post
    if (target.user.toString() === userId) {
      return res
        .status(403)
        .json({ message: `Cannot vote on your own ${targetType}` })
    }

    // Find existing vote
    const existingVote = await Vote.findOne({
      user: userId,
      targetId,
      targetType,
    })

    // If same vote, remove it
    if (existingVote && existingVote.voteType === voteType) {
      await Vote.deleteOne({ _id: existingVote._id })
      const update =
        voteType === "upvote"
          ? { $inc: { upvoteCount: -1 } }
          : { $inc: { downvoteCount: -1 } }
      await TargetModel.updateOne({ _id: targetId }, update)
    }
    // If different vote or no vote, update or create
    else {
      if (existingVote) {
        // Remove old vote
        await Vote.deleteOne({ _id: existingVote._id })
        const update =
          existingVote.voteType === "upvote"
            ? { $inc: { upvoteCount: -1 } }
            : { $inc: { downvoteCount: -1 } }
        await TargetModel.updateOne({ _id: targetId }, update)
      }
      // Add new vote
      await new Vote({ user: userId, targetId, targetType, voteType }).save()
      const update =
        voteType === "upvote"
          ? { $inc: { upvoteCount: 1 } }
          : { $inc: { downvoteCount: 1 } }
      await TargetModel.updateOne({ _id: targetId }, update)

      // ✅ Send vote notification (only for new votes)
      await pb.collection("notifications").create({
        userId: target.user,
        type: "vote",
        questionId: targetType === "question" ? target._id : target.question,
        answerId: targetType === "answer" ? target._id : null,
        content: `${req.user.firstname} ${voteType}d your ${targetType}.`,
        read: false,
        link:
          targetType === "question"
            ? `/questions/${target._id}`
            : `/questions/${target.question}#answer-${target._id}`,
      })
    }

    // Fetch updated target
    const updatedTarget = await TargetModel.findById(targetId)

    res.status(200).json({
      upvoteCount: updatedTarget.upvoteCount,
      downvoteCount: updatedTarget.downvoteCount,
    })
  } catch (err) {
    console.error("POST /api/votes error:", err.message)
    try {
      const existingVote = await Vote.findOne({
        user: userId,
        targetId,
        targetType,
      })
      if (existingVote) {
        await Vote.deleteOne({ _id: existingVote._id })
        const update =
          existingVote.voteType === "upvote"
            ? { $inc: { upvoteCount: -1 } }
            : { $inc: { downvoteCount: -1 } }
        await (targetType === "question" ? Question : Answer).updateOne(
          { _id: targetId },
          update
        )
      }
    } catch (rollbackErr) {
      console.error("Rollback error:", rollbackErr.message)
    }
    res.status(500).json({ message: `Error processing vote: ${err.message}` })
  }
})

// GET /api/votes/user - Fetch user's votes for multiple targets
router.get("/user", verifyUser, async (req, res) => {
  const { targetIds, targetType } = req.query
  const userId = req.user.id

  try {
    const targetIdArray = targetIds.split(",")
    const votes = await Vote.find({
      user: userId,
      targetId: { $in: targetIdArray },
      targetType,
    })
    res.status(200).json(votes)
  } catch (err) {
    console.error("GET /api/votes/user error:", err.message)
    res.status(500).json({ message: `Error fetching votes: ${err.message}` })
  }
})

export default router
