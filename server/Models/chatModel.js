import mongoose from "mongoose"

const ChatSchema = new mongoose.Schema(
  {
    members: {
      type: Array,
    },
  },
  { timestamps: true }
)

// Check if the model is already compiled, otherwise define it
const ChatModel = mongoose.models.Chat || mongoose.model("Chat", ChatSchema)

export default ChatModel
