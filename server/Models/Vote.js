import mongoose from "mongoose"

const voteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    targetType: { type: String, enum: ["question", "answer"], required: true },
    voteType: { type: String, enum: ["upvote", "downvote"], required: true },
  },
  {
    timestamps: true,
  }
)

// Unique index to prevent multiple votes by the same user on the same target
voteSchema.index({ user: 1, targetId: 1, targetType: 1 }, { unique: true })

export default mongoose.model("Vote", voteSchema)
