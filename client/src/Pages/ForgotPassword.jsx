import { useState } from "react"
import { useNavigate } from "react-router-dom"
import ForgotPasswordForm from "../main-components/ForgotPasswordForm"

export default function ForgotPassword() {
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  const handleForgotPassword = async (email) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      )

      const data = await response.json()
      if (response.ok) {
        setMessage(data.message)
        setError("")
        setTimeout(() => navigate("/login"), 3000)
      } else {
        setError(data.message)
        setMessage("")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      setMessage("")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Forgot Password
        </h2>
        {error && (
          <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
        )}
        {message && (
          <p className="text-green-500 dark:text-green-400 mb-4">{message}</p>
        )}
        <ForgotPasswordForm onSubmit={handleForgotPassword} />
      </div>
    </div>
  )
}
