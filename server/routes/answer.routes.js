import express from "express"
import {
  restrictToAuthorOrAdmin,
  verifyUser,
} from "../Middlewares/authcheck.middleware.js"

import Question from "../Models/Question.js"
import Answer from "../Models/Answer.js"
import pb from "../utils/pocketBaseClient.js"

const router = express.Router()

// Get answers (with optional userId filter)
router.get("/", verifyUser, async (req, res) => {
  try {
    const { userId } = req.query
    const query = userId ? { user: userId } : {}
    const answers = await Answer.find(query)
      .sort({ createdAt: -1 })
      .populate("user", "firstname lastname picture")
      .populate("question", "content")
      .exec()
    res.status(200).json(answers)
  } catch (err) {
    console.error("GET /answers error:", err.message)
    res.status(500).json({ message: `Error fetching answers: ${err.message}` })
  }
})

// POST a new answer
router.post("/", verifyUser, async (req, res) => {
  try {
    const { content, questionId } = req.body
    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({ message: "Content is required" })
    }
    if (!questionId) {
      return res.status(400).json({ message: "Question ID is required" })
    }
    const question = await Question.findById(questionId)
    if (!question) {
      return res.status(404).json({ message: "Question not found" })
    }
    const answer = new Answer({
      content,
      user: req.user._id,
      question: questionId,
    })
    await answer.save()
    question.answers.push(answer._id)
    await question.save()

    // ✅ Send notification to question owner (if not the same user)
    if (String(question.user) !== String(req.user._id)) {
      await pb.collection("notifications").create({
        userId: question.user,
        type: "new_answer",
        questionId: questionId,
        answerId: answer._id,
        content: `${req.user.firstname} answered your question.`,
        read: false,
        link: `/questions/${questionId}#answer-${answer._id}`,
      })
    }

    await answer.populate("user", "firstname lastname picture")
    res.status(201).json({ message: "Answer added", answer })
  } catch (error) {
    console.error("POST /answers error:", error.message, error.stack)

    res.status(500).json({ message: error.message })
  }
})

// PUT update an answer
router.put("/:id", verifyUser, restrictToAuthorOrAdmin, async (req, res) => {
  try {
    const { content } = req.body
    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({ message: "Content is required" })
    }
    const answer = req.answer
    answer.content = content
    answer.updatedAt = Date.now()
    await answer.save()
    await answer.populate("user", "firstname lastname picture")

    res.status(200).json({ message: "Answer updated", answer })
  } catch (error) {
    console.error("PUT /answers/:id error:", error.message)
    res.status(500).json({ message: error.message })
  }
})

// DELETE an answer
router.delete("/:id", verifyUser, restrictToAuthorOrAdmin, async (req, res) => {
  try {
    const answer = req.answer
    await Answer.findByIdAndDelete(answer._id)
    await Question.updateOne(
      { _id: answer.question },
      { $pull: { answers: answer._id } }
    )

    res.status(200).json({ message: "Answer deleted" })
  } catch (error) {
    console.error("DELETE /answers/:id error:", error.message)
    res.status(500).json({ message: error.message })
  }
})

export default router
