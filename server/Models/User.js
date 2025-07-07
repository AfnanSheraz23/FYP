import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    idCardImage: {
      type: String,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    banExpires: {
      type: Date,
      default: null,
    },
    picture: {
      type: String,
    },
    interests: {
      type: [String],
    },
    bio: {
      type: String,
      default: "",
      maxlength: 200,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model("User", userSchema)
