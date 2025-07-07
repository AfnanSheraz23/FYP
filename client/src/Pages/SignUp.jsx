import axios from "axios"
import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Toast from "../main-components/Toast"

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  })

  const [confirmPassword, setConfirmPassword] = useState("")

  const [idCard, setIdCard] = useState(null)

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [toast, setToast] = useState({ message: "", type: "" })

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "confirmPassword") {
      setConfirmPassword(value)
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (
      !formData.firstname ||
      !formData.lastname ||
      !formData.email ||
      !formData.password ||
      !confirmPassword ||
      !idCard
    ) {
      setToast({
        message: "Please fill in all fields and upload ID card.",
        type: "error",
      })
      return
    }

    if (formData.password !== confirmPassword) {
      setToast({ message: "Passwords do not match.", type: "error" })
      return
    }

    setError("")
    setLoading(true)

    const formPayload = new FormData()
    formPayload.append("firstname", formData.firstname)
    formPayload.append("lastname", formData.lastname)
    formPayload.append("email", formData.email)
    formPayload.append("password", formData.password)
    formPayload.append("idCard", idCard)

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        formPayload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      console.log(response.data)

      setToast({
        message: "Sign up successful! Pending verification.",
        type: "success",
      })
      setTimeout(() => {
        setToast({ message: "", type: "" })
      }, 3000)

      setFormData({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
      })

      setConfirmPassword("")
    } catch (err) {
      console.error(err)
      setToast({
        message: "Something went wrong. Please try again.",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center m-3">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
          Sign Up
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex flex-col md:flex-row gap-1">
            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              placeholder="First name"
              className="mb-4 p-2 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 input"
              required
            />

            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              placeholder="Last name"
              className="mb-4 p-2 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 input"
              required
            />
          </div>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            className="mb-4 p-2 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 input"
            required
          />

          <input
            type="file"
            name="idCard"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0]
              if (file) {
                setIdCard(file)
              }
            }}
            className="text-sm text-gray-900 dark:text-gray-100 focus:outline-none mb-4 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
            required
          />

          <div className="flex flex-col md:flex-row gap-1">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter a password"
              className="mb-4 p-2 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 input"
              required
            />

            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              className="mb-4 p-2 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 input"
              required
            />
          </div>

          {error && (
            <p
              style={{ color: "red" }}
              className="text-red-500 dark:text-red-400"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="black-button border dark:border-black rounded transition"
          >
            {loading ? "Submitting..." : "Sign Up"}
          </button>
        </form>

        {toast.message && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ message: "", type: "" })}
          />
        )}

        <div className="text-center mt-6">
          <p className="mt-6 mb-8 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUp
