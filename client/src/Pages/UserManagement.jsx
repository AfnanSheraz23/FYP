import { useEffect, useState } from "react"
import instance from "../axios"

export default function UserManagement() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    instance.get("/api/admin/users").then((res) => {
      setUsers(res.data)
    })
  }, [])

  const blockUser = (id) => {
    instance.put(`/api/admin/block/${id}`).then(() => {
      setUsers((users) =>
        users.map((user) =>
          user._id === id ? { ...user, isBlocked: true } : user
        )
      )
    })
  }

  const unblockUser = (id) => {
    instance.put(`/api/admin/unblock/${id}`).then(() => {
      setUsers((users) =>
        users.map((user) =>
          user._id === id ? { ...user, isBlocked: false } : user
        )
      )
    })
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        User Management
      </h2>
      {users.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No users found</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li
              key={user._id}
              className="mb-4 border border-gray-300 dark:border-gray-700 p-4 rounded"
            >
              <p className="text-gray-900 dark:text-gray-100">
                Name: {user.firstname} {user.lastname}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Email: {user.email}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Status: {user.isBlocked ? "Blocked" : "Active"}
              </p>
              <button
                onClick={() =>
                  user.isBlocked ? unblockUser(user._id) : blockUser(user._id)
                }
                className={`mt-2 ${
                  user.isBlocked
                    ? "bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800"
                    : "bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800"
                } text-white px-3 py-1 rounded`}
                disabled={user.isAdmin} // Prevent blocking admins
              >
                {user.isBlocked ? "Unblock" : "Block"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
