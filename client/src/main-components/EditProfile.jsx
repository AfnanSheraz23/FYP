import React, { useState, useEffect } from "react"
import { useNavigate, NavLink } from "react-router-dom"
import instance from "../axios"
import useAuthStore from "../store/authStore"

const EditProfile = () => {
  const { user, fetchUser } = useAuthStore()
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    bio: "",
    picture: null,
  })
  const [preview, setPreview] = useState("")

  useEffect(() => {
    if (!user) fetchUser()
  }, [user, fetchUser])

  useEffect(() => {
    if (user) {
      setFormData({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        bio: user.bio || "",
        picture: null,
      })
      setPreview(user.picture || "")
    }
  }, [user])

  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name === "picture" && files[0]) {
      setFormData((prev) => ({ ...prev, picture: files[0] }))
      setPreview(URL.createObjectURL(files[0])) // Create preview URL
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = new FormData()
      data.append("firstname", formData.firstname)
      data.append("lastname", formData.lastname)
      data.append("bio", formData.bio)
      if (formData.picture) {
        data.append("picture", formData.picture)
      }

      await instance.put("/api/user/profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      navigate("/profile")
    } catch (err) {
      console.error("Failed to update profile:", err)
    }
  }

  return (
    <div className="mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg">
      <h2 className="text-center text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
        Edit Profile
      </h2>

      <form onSubmit={handleSubmit}>
        {/* First Name */}
        <div className="mb-4">
          <input
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-100 input"
            placeholder="First Name"
          />
        </div>

        {/* Last Name */}
        <div className="mb-4">
          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-100 input"
            placeholder="Last Name"
          />
        </div>

        {/* Bio */}
        <div className="mb-4">
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-100 input"
            placeholder="Tell us about yourself"
            rows="4"
          />
        </div>

        {/* Picture File Input */}
        <div className="mb-4">
          <label
            htmlFor="picture"
            className="block font-bold mb-2 text-gray-700 dark:text-gray-300"
          >
            Profile Picture
          </label>
          <input
            type="file"
            name="picture"
            onChange={handleChange}
            accept="image/*"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Profile picture preview */}
        {preview && (
          <div className="mb-4 text-center">
            <img
              src={preview}
              alt="Profile Preview"
              className="w-24 h-24 rounded-full object-cover mx-auto"
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between items-center">
          <button type="submit" className="black-button">
            Update
          </button>
          <NavLink
            to="/profile"
            className="bg-gray-400 dark:bg-gray-600 hover:bg-gray-500 dark:hover:bg-gray-700 text-white font-medium py-2 px-4 rounded text-center"
          >
            Cancel
          </NavLink>
        </div>
      </form>
    </div>
  )
}

export default EditProfile
