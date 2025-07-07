import express from "express"
import {
  verifyUser,
  restrictToAuthorOrAdmin,
} from "../Middlewares/authcheck.middleware.js"
import Question from "../Models/Question.js"

const router = express.Router()

// Get all questions
// router.get("/", verifyUser, async (req, res) => {
//   try {
//     const questions = await Question.find()
//       .sort({ createdAt: -1 })
//       .populate([
//         { path: "user", select: "firstname lastname picture" },
//         { path: "answers" },
//       ])
//       .exec()
//     res.status(200).json(questions)
//   } catch (err) {
//     console.error("GET /questions error:", err.message)
//     res
//       .status(500)
//       .json({ message: `Error fetching questions: ${err.message}` })
//   }
// })

// Get all questions (with optional userId filter)
router.get("/", verifyUser, async (req, res) => {
  try {
    const { userId } = req.query
    const query = userId ? { user: userId } : {}
    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .populate([
        { path: "user", select: "firstname lastname picture" },
        { path: "answers" },
      ])
      .exec()
    res.status(200).json(questions)
  } catch (err) {
    console.error("GET /questions error:", err.message)
    res
      .status(500)
      .json({ message: `Error fetching questions: ${err.message}` })
  }
})

// Get a single question by ID
router.get("/:id", verifyUser, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate([
        { path: "user", select: "firstname lastname picture" },
        {
          path: "answers",
          populate: { path: "user", select: "firstname lastname picture" },
          options: { sort: { createdAt: -1 } },
        },
      ])
      .exec()
    if (!question) {
      return res.status(404).json({ message: "Question not found" })
    }
    res.status(200).json(question)
  } catch (err) {
    console.error("GET /questions/:id error:", err.message)
    res.status(500).json({ message: `Error fetching question: ${err.message}` })
  }
})

// Create a new question
router.post("/", verifyUser, async (req, res) => {
  try {
    const { content } = req.body
    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({ message: "Content is required" })
    }
    const question = new Question({
      content,
      user: req.user._id,
    })
    await question.save()
    await question.populate([
      { path: "user", select: "firstname lastname picture" },
      { path: "answers" },
    ])
    res.status(201).json({ message: "Question added", question })
  } catch (error) {
    console.error("POST /questions error:", error.message)
    res.status(500).json({ message: error.message })
  }
})

// Edit a question
router.put("/:id", verifyUser, restrictToAuthorOrAdmin, async (req, res) => {
  try {
    const { content } = req.body
    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({ message: "Content is required" })
    }
    const question = req.question // Set by restrictToAuthorOrAdmin
    question.content = content
    question.updatedAt = Date.now()
    await question.save()
    await question.populate([
      { path: "user", select: "firstname lastname picture" },
      { path: "answers" },
    ])
    res.status(200).json({ message: "Question updated", question })
  } catch (error) {
    console.error("PUT /questions/:id error:", error.message)
    res.status(500).json({ message: error.message })
  }
})

// Delete a question
router.delete("/:id", verifyUser, restrictToAuthorOrAdmin, async (req, res) => {
  try {
    const question = req.question // Set by restrictToAuthorOrAdmin
    await Question.deleteOne({ _id: question._id })
    res.status(200).json({ message: "Question deleted" })
  } catch (error) {
    console.error("DELETE /questions/:id error:", error.message)
    res.status(500).json({ message: error.message })
  }
})

export default router
