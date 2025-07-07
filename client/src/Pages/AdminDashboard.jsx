import { useState } from "react"
import AdminPanel from "./AdminPanel"
import UserManagement from "./UserManagement"
import ReportManagement from "./ReportManagement"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("admin")

  return (
    <div className=" mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Admin Dashboard
      </h1>

      {/* Tab Navigation */}
      <div className="border-b border-gray-500 dark:border-gray-600 pb-2 mb-4 text-sm">
        <button
          onClick={() => setActiveTab("admin")}
          className={`mr-4 ${
            activeTab === "admin"
              ? "text-red-500 dark:text-red-400"
              : "text-gray-500 dark:text-gray-400"
          } hover:text-red-400 dark:hover:text-red-300`}
        >
          Admin Panel
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`${
            activeTab === "users"
              ? "text-red-500 dark:text-red-400"
              : "text-gray-500 dark:text-gray-400"
          } hover:text-red-400 dark:hover:text-red-300`}
        >
          User Management
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`${
            activeTab === "reports"
              ? "text-red-500 dark:text-red-400"
              : "text-gray-500 dark:text-gray-400"
          } hover:text-red-400 dark:hover:text-red-300`}
        >
          Reports
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        {activeTab === "admin" && <AdminPanel />}
        {activeTab === "users" && <UserManagement />}
        {activeTab === "reports" && <ReportManagement />}
      </div>
    </div>
  )
}
