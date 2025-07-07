import express from "express"
import Report from "../Models/Report.js"
import Question from "../Models/Question.js"

const router = express.Router()

// POST /api/reports
router.post("/", async (req, res) => {
  try {
    const { questionId, reason, comment, reporterId } = req.body
    const question = await Question.findById(questionId)
    if (!question) {
      return res.status(404).json({ message: "Question not found" })
    }
    const report = new Report({
      questionId,
      reportedUserId: question.user,
      reporterId,
      reason,
      comment,
      status: "pending",
    })
    await report.save()
    res.status(201).json({ message: "Report submitted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/reports
router.get("/", async (req, res) => {
  try {
    const { status } = req.query
    const filter = status ? { status } : {}
    const reports = await Report.find(filter)
      .populate("questionId", "content")
      .populate("reportedUserId", "firstname lastname")
      .populate("reporterId", "firstname lastname")
    res.status(200).json(reports)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// PATCH /api/reports/:id
router.patch("/:id", async (req, res) => {
  try {
    const { status, action, banDuration } = req.body
    const report = await Report.findById(req.params.id)
    if (!report) {
      return res.status(404).json({ message: "Report not found" })
    }
    if (status) {
      report.status = status
    }
    await report.save()

    if (action === "ban") {
      const user = await User.findById(report.reportedUserId)
      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }
      user.isBlocked = true
      user.banExpires = banDuration
        ? new Date(Date.now() + banDuration * 24 * 60 * 60 * 1000)
        : null
      await user.save()
      // Optionally send notification to reported user
    }

    // Optionally send notification to reporter
    res.status(200).json({ message: "Report updated successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
