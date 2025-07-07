import mongoose from "mongoose"

const reportSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  reportedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reason: {
    type: String,
    required: true,
    enum: ["spam", "harassment", "offensive", "misinformation", "other"],
  },
  comment: { type: String },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "reviewed", "resolved"],
  },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model("Report", reportSchema)
