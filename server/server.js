import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import cors from "cors"
import cookieParser from "cookie-parser"

// Import route modules
import authRoutes from "./routes/auth.routes.js"
import questionRoutes from "./routes/question.routes.js"
import answerRoutes from "./routes/answer.routes.js"
import voteRoutes from "./routes/vote.routes.js"
import adminRoutes from "./routes/admin.routes.js"
import userRoutes from "./routes/user.routes.js"
import ChatRoute from "./routes/ChatRoute.js"
import MessageRoute from "./routes/MessageRoute.js"
import notificationRoutes from "./routes/notificationRoutes.js"
import searchRoutes from "./routes/searchRoutes.js"
import reportRoutes from "./routes/report.routes.js"

dotenv.config()

// Handle path for ES6 modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Body parser middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// CORS and cookie parser
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
)
app.use(cookieParser())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/questions", questionRoutes)
app.use("/api/answers", answerRoutes)
app.use("/api/votes", voteRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/user", userRoutes)
app.use("/api/chat", ChatRoute)
app.use("/api/message", MessageRoute)
app.use("/api/notify", notificationRoutes)
app.use("/api", searchRoutes)
app.use("/api/reports", reportRoutes)

// Static file serving for uploaded files
app.use("/uploads", express.static(path.join(__dirname, "/uploads")))

// Connect to MongoDB and start the server
const PORT = process.env.PORT || 5000
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected")
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  .catch((err) => console.error("MongoDB connection error:", err.message))
