import jwt from "jsonwebtoken"
import User from "../Models/User.js"

// ---------------- verifyUser (cookies, authorization) -----------------
export const verifyUser = async (req, res, next) => {
  try {
    let token

    // First check Authorization header
    const authHeader = req.header("Authorization")
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "")
    }

    // Then check cookies (via cookie-parser)
    else if (req.cookies?.token) {
      token = req.cookies.token
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Fetch user and attach to req
    const user = await User.findById(decoded.id)
    if (!user) return res.status(404).json({ message: "User not found" })
    if (user.isBlocked) {
      return res.status(403).json({ message: "Account is blocked" })
    }

    req.user = user
    next()
  } catch (err) {
    console.error("Authentication Error:", err)
    res.status(401).json({ message: "Unauthorized" })
  }
}

// ================ admin only =================
export const adminOnly = (req, res, next) => {
  if (req.user?.role === "admin") {
    next()
  } else {
    return res.status(403).json({ message: "Access denied: Admins only" })
  }
}

// ================ role based authorization ============
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user?.role)) {
      res.status(403).json({ msg: "Access denied" })
    }
    next()
  }
}

// =========== check for question and answer delete/edit purpose =======
export const restrictToAuthorOrAdmin = async (req, res, next) => {
  try {
    let resource
    const isAnswerRoute =
      req.baseUrl.includes("/api/answers") ||
      req.originalUrl.includes("/answers")
    const isQuestionRoute =
      req.baseUrl.includes("/api/questions") ||
      req.originalUrl.includes("/questions")

    if (isAnswerRoute) {
      resource = await Answer.findById(req.params.id)
      if (!resource) {
        return res.status(404).json({ message: "Answer not found" })
      }
      req.answer = resource
    } else if (isQuestionRoute) {
      resource = await Question.findById(req.params.id)
      if (!resource) {
        return res.status(404).json({ message: "Question not found" })
      }
      req.question = resource
    } else {
      return res.status(400).json({ message: "Invalid resource type" })
    }

    if (
      resource.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message:
          "Access denied: Only the author or admins can perform this action",
      })
    }

    next()
  } catch (error) {
    console.error("restrictToAuthorOrAdmin error:", error.message)
    res.status(500).json({ message: "Server error" })
  }
}
