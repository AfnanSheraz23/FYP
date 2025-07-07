import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import instance from "../axios"
import useAuthStore from "../store/authStore"
import Toast from "../main-components/Toast"

const Login = () => {
  const navigate = useNavigate()
  const fetchUser = useAuthStore((state) => state.fetchUser)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ message: "", type: "" })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      setToast({ message: "Please fill in all fields.", type: "error" })
      return
    }

    setLoading(true)
    setToast({ message: "", type: "" })

    try {
      const response = await instance.post("/api/auth/login", {
        email: formData.email,
        password: formData.password,
      })

      // Store token and fetch user
      localStorage.setItem("token", response.data.token)
      await fetchUser()

      // Show success toast and redirect
      setToast({ message: "Login successful!", type: "success" })
      setTimeout(() => {
        navigate("/")
      }, 2000)
    } catch (error) {
      console.error("Login error:", error)
      const message =
        error.response?.status === 403 &&
        error.response?.data?.message === "Account is blocked"
          ? "Account is blocked"
          : error.response?.data?.message || "Invalid email or password"
      setToast({ message, type: "error" })
    } finally {
      setLoading(false)

      // Auto-close the toast after 3 seconds
      setTimeout(() => {
        setToast({ message: "", type: "" })
      }, 3000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md text-center mx-3">
        <h2 className="text-2xl font-semibold mb-5 text-gray-900 dark:text-gray-100">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 input"
            required
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 input"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="black-button border dark:border-black"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {toast.message && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ message: "", type: "" })}
          />
        )}

        <p>
          <Link
            to="/forgot-password"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Forgot Password?
          </Link>
        </p>

        <p className="mt-6 mb-8 text-sm text-gray-600 dark:text-gray-400">
          Don’t have an account?{" "}
          <Link
            to="/auth/register"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
