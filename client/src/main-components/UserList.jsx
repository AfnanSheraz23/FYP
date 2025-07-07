import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import useAuthStore from "../store/authStore"
import defaultImage from "../default_image/blank-profile-picture.png"
import instance from "../axios"
import { format } from "timeago.js"

export default function UserList() {
  const { loading, error } = useAuthStore()
  const [users, setUsers] = useState([])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await instance.get("/api/user")
        setUsers(res.data)
      } catch (err) {
        console.error("Error fetching users:", err.message)
      }
    }
    fetchUsers()
  }, [])

  if (loading) return <div className="text-center fs-400">Loading...</div>
  if (error) return <div className="text-red-500 fs-400">{error}</div>
  if (users.length === 0) return <div className="fs-400">No users found.</div>

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4 fs-600">Users</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <div
            key={user._id}
            className="bg-white p-4 border border-gray-300 rounded hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <img
                src={
                  user.picture
                    ? `http://localhost:5000${user.picture}`
                    : defaultImage
                }
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = defaultImage
                }}
              />
              <div>
                <Link
                  to={`/users/${user._id}`}
                  className="font-semibold text-gray-800 hover:text-gray-600 hover:underline"
                >
                  {user.firstname} {user.lastname}
                  {user.username && (
                    <span className="text-gray-600"> (@{user.username})</span>
                  )}
                </Link>
                <p className="fs-300 text-gray-600">
                  Joined {format(user.createdAt)}
                </p>
              </div>
            </div>
            {user.bio && (
              <p className="fs-300 mt-2 text-gray-800">{user.bio}</p>
            )}
            {user.interests.length > 0 && (
              <p className="fs-300 mt-1 text-gray-600">
                Expertise: {user.expertise.join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
