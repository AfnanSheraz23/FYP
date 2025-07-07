import { useEffect, useState } from "react"
import instance from "../axios"
import { Link } from "react-router-dom"

const AnswerTab = ({ userId }) => {
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserAnswers = async () => {
      try {
        setLoading(true)
        const res = await instance.get("/api/answers", {
          params: { userId },
        })
        setAnswers(res.data)
        setLoading(false)
        setError(null)
      } catch (err) {
        console.error("Fetch User Answers Error:", err)
        setError("Failed to load answers.")
        setLoading(false)
      }
    }

    if (userId) {
      fetchUserAnswers()
    }
  }, [userId])

  if (loading) return <div>Loading answers...</div>
  if (error) return <div>{error}</div>
  if (answers.length === 0) return <div>No answers posted yet.</div>

  // Filter answers to include only those with a valid question
  const validAnswers = answers.filter((answer) => answer.question)

  if (validAnswers.length === 0) return <div>No valid answers found.</div>

  return (
    <div className="space-y-4">
      {validAnswers.map((answer) => (
        <div
          key={answer._id}
          className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700"
        >
          <p className="text-gray-700 dark:text-gray-300">{answer.content}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Answered on {new Date(answer.createdAt).toLocaleDateString()} to{" "}
            <Link
              to={`/questions/${answer.question._id}`}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              question
            </Link>
          </p>
        </div>
      ))}
    </div>
  )
}

export default AnswerTab
