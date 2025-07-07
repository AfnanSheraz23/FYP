import express from "express"

import Question from "../Models/Question.js"
import Answer from "../Models/Answer.js"
import User from "../Models/User.js"

const router = express.Router()

router.get("/search", async (req, res) => {
  const { keyword } = req.query

  if (!keyword || keyword.trim() === "") {
    return res.status(400).json({ message: "Keyword is required" })
  }

  const regex = new RegExp(keyword, "i")

  try {
    const [questions, answers, users] = await Promise.all([
      Question.find({ content: regex })
        .populate("user", "firstname lastname picture ")
        .select("content description createdAt")
        .limit(10)
        .lean(),
      Answer.find({ content: regex })
        .populate("user", "firstname lastname picture ")
        .select("content createdAt questionId")
        .limit(10)
        .lean(),
      User.find({
        $or: [
          { firstname: regex },
          { lastname: regex },
          { username: regex },
          { interests: regex },
        ],
      })
        .select("firstname lastname picture username interests")
        .limit(10)
        .lean(),
    ])

    res.status(200).json({
      questions,
      answers,
      users,
    })
  } catch (err) {
    console.error("Search error:", err)
    res.status(500).json({ message: "Server error during search" })
  }
})

export default router
