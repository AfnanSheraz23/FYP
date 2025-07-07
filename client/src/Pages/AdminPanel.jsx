import { useEffect, useState } from "react"
import instance from "../axios"

export default function AdminPanel() {
  const [pendingUsers, setPendingUsers] = useState([])

  useEffect(() => {
    instance.get("/api/admin/pending").then((res) => {
      setPendingUsers(res.data)
    })
  }, [])

  const approveUser = (id) => {
    instance.put(`/api/admin/approve/${id}`).then(() => {
      setPendingUsers((users) => users.filter((user) => user._id !== id))
    })
  }

  const rejectUser = (id) => {
    instance.delete(`/api/admin/reject/${id}`).then(() => {
      setPendingUsers((users) => users.filter((user) => user._id !== id))
    })
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Pending Users
      </h2>
      {pendingUsers.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No pending users</p>
      ) : (
        <ul>
          {pendingUsers.map((user) => (
            <li
              key={user._id}
              className="mb-4 border border-gray-300 dark:border-gray-700 p-4 rounded"
            >
              <p className="text-gray-900 dark:text-gray-100">
                Name: {user.firstname} {user.lastname}
              </p>
              <img
                src={`http://localhost:5000/${user.idCardImage}`}
                alt="ID Card"
                className="w-40 mt-2"
              />
              <button
                onClick={() => approveUser(user._id)}
                className="mt-2 bg-green-600 dark:bg-green-700 text-white px-3 py-1 rounded hover:bg-green-700 dark:hover:bg-green-800"
              >
                Approve
              </button>
              <button
                onClick={() => rejectUser(user._id)}
                className="mt-2 bg-red-600 dark:bg-red-700 text-white px-3 py-1 rounded hover:bg-red-700 dark:hover:bg-red-800"
              >
                Reject
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
