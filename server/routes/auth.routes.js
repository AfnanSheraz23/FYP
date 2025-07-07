import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { upload } from "../Middlewares/upload.middleware.js"
import User from "../Models/User.js"

const router = express.Router()

// --------------------- Register -------------------------------
router.post("/register", upload.single("idCard"), async (req, res) => {
  try {
    // interests = []
    const { firstname, lastname, email, password } = req.body

    // Check if the email already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const idCard = req.file ? req.file.path : null

    const newUser = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      // interests
      idCardImage: idCard,
    })

    await newUser.save()

    res
      .status(201)
      .json({ message: "User registered. Pending admin approval." })
  } catch (error) {
    console.error("Register Error:", error)
    res.status(500).json({ message: "Server error during registration." })
  }
})

// --------------------- Login -------------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." })
    }

    if (!user.isApproved) {
      return res.status(403).json({ message: "Not approved by Admin" })
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Account is blocked" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." })
    }

    // creating token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    )

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // false in dev
      sameSite: "Lax", // or "None" with https
      // maxAge: 60 * 60 * 1000, // 1 hour
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    })

    res.status(200).json({
      message: "User logged in successfully",
      token,
    })
  } catch (error) {
    console.error("Login Error:", error)
    res.status(500).json({ message: "Server error during login." })
  }
})

// --------------------- Forgot Password -------------------------------
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Account is blocked" })
    }

    // Generate reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    })

    // Save reset token and expiry to user
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = Date.now() + 3600000 // 1 hour
    await user.save()

    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    const emailContent = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #ef4444; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
    `

    await sendEmail(user.email, "Password Reset Request", emailContent)

    res.status(200).json({ message: "Password reset email sent" })
  } catch (error) {
    console.error("Forgot Password Error:", error)
    res.status(500).json({ message: "Server error during password reset" })
  }
})

// --------------------- Reset Password -------------------------------
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body

    // Verify token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired token" })
    }

    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" })
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.status(200).json({ message: "Password reset successfully" })
  } catch (error) {
    console.error("Reset Password Error:", error)
    res.status(500).json({ message: "Server error during password reset" })
  }
})

router.get("/me", async (req, res) => {
  let token = req.cookies.token

  if (!token) {
    return res.status(401).json({ message: "No token provided" })
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded

    const user = await User.findById(req.user.id).select("-password")
    if (!user) return res.status(404).json({ message: "User not found" })

    res.json(user)
  } catch (err) {
    res.status(401).json({ message: "Invalid token" })
  }
})

// =================== logout ====================
router.post("/logout", (req, res) => {
  res.clearCookie("token")
  res.json({ message: "Logged out successfully" })
})

export default router
