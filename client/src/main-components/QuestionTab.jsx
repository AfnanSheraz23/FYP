import { useEffect, useState } from "react"
import instance from "../axios"
import { Link } from "react-router-dom"

const QuestionTab = ({ userId }) => {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserQuestions = async () => {
      try {
        setLoading(true)
        const res = await instance.get("/api/questions", {
          params: { userId }, // Filter questions by userId
        })
        setQuestions(res.data)
        setLoading(false)
        setError(null)
      } catch (err) {
        console.error("Fetch User Questions Error:", err)
        setError("Failed to load questions.")
        setLoading(false)
      }
    }

    if (userId) {
      fetchUserQuestions()
    }
  }, [userId])

  if (loading) return <div>Loading questions...</div>
  if (error) return <div>{error}</div>
  if (questions.length === 0) return <div>No questions posted yet.</div>

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <div
          key={question._id}
          className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700"
        >
          <Link
            to={`/questions/${question._id}`}
            className="text-gray-800 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-400 fs-500 hover:underline no-underline"
          >
            <h3 className="text-lg font-medium">{question.content}</h3>
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Posted on {new Date(question.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  )
}

export default QuestionTab
