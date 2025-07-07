import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import useReportStore from "../store/reportStore"
import Toast from "../main-components/Toast"

export default function ReportManagement() {
  const { reports, loading, error, fetchReports, updateReport } =
    useReportStore()
  const [filter, setFilter] = useState("")
  const [toast, setToast] = useState({ message: "", type: "" })
  const [confirmation, setConfirmation] = useState({
    show: false,
    reportId: null,
    action: "",
    banDuration: null,
  })

  useEffect(() => {
    fetchReports(filter)
  }, [filter, fetchReports])

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
  }

  const handleActionClick = (reportId, action, banDuration = null) => {
    setConfirmation({ show: true, reportId, action, banDuration })
  }

  const confirmAction = async () => {
    try {
      const { reportId, action, banDuration } = confirmation
      if (action === "dismiss") {
        await updateReport(reportId, { status: "resolved" })
        setToast({ message: "Report dismissed successfully!", type: "success" })
      } else if (action === "ban") {
        await updateReport(reportId, {
          status: "resolved",
          action: "ban",
          banDuration,
        })
        setToast({
          message: `User banned successfully for ${
            banDuration ? "7 days" : "permanently"
          }!`,
          type: "success",
        })
      }
      // Refetch reports to update UI
      await fetchReports(filter)
    } catch (err) {
      console.error("Error processing report:", err.message)
      setToast({
        message: `Failed to process report: ${err.message}`,
        type: "error",
      })
    } finally {
      setConfirmation({
        show: false,
        reportId: null,
        action: "",
        banDuration: null,
      })
      setTimeout(() => setToast({ message: "", type: "" }), 3000)
    }
  }

  const cancelAction = () => {
    setConfirmation({
      show: false,
      reportId: null,
      action: "",
      banDuration: null,
    })
  }

  if (loading)
    return <div className="text-gray-900 dark:text-gray-100">Loading...</div>
  if (error)
    return <div className="text-red-500 dark:text-red-400">{error}</div>

  return (
    <div className="p-4">
      {confirmation.show && (
        <Toast
          message={`Are you sure you want to ${
            confirmation.action === "dismiss"
              ? "dismiss this report"
              : `ban the user ${
                  confirmation.banDuration ? "for 7 days" : "permanently"
                }`
          }?`}
          type="confirmation"
          onConfirm={confirmAction}
          onCancel={cancelAction}
        />
      )}

      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "" })}
        />
      )}

      <div className="mb-4">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Reports
        </h2>
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          Filter by Status
        </label>
        <select
          value={filter}
          onChange={handleFilterChange}
          className="w-full max-w-xs p-2 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-900 dark:text-gray-100"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="text-gray-900 dark:text-gray-100">
            No reports found.
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report._id}
              className="bg-white dark:bg-gray-800 p-4 border border-gray-300 dark:border-gray-700 rounded hover:shadow-md"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Reported User:{" "}
                    <Link
                      to={`/profile/${report.reportedUserId?._id || ""}`}
                      className="text-blue-500 dark:text-blue-400 hover:underline"
                    >
                      {report.reportedUserId?.firstname || "Unknown"}{" "}
                      {report.reportedUserId?.lastname || ""}
                    </Link>
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Reporter:{" "}
                    <Link
                      to={`/profile/${report.reporterId?._id || ""}`}
                      className="text-blue-500 dark:text-blue-400 hover:underline"
                    >
                      {report.reporterId?.firstname || "Unknown"}{" "}
                      {report.reporterId?.lastname || ""}
                    </Link>
                  </p>
                </div>
                <p className="text-gray-900 dark:text-gray-100">
                  Question:{" "}
                  <Link
                    to={`/questions/${report.questionId?._id || ""}`}
                    className="text-blue-500 dark:text-blue-400 hover:underline"
                    disabled={report.status === "resolved"}
                  >
                    {report.questionId?.content || "Question not available"}
                  </Link>
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Reason: {report.reason || "N/A"}
                </p>
                {report.comment && (
                  <p className="text-gray-600 dark:text-gray-400">
                    Comment: {report.comment}
                  </p>
                )}
                <p className="text-gray-600 dark:text-gray-400">
                  Status: {report.status || "N/A"}{" "}
                  {report.status === "resolved" && (
                    <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Resolved
                    </span>
                  )}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Reported:{" "}
                  {report.createdAt
                    ? new Date(report.createdAt).toLocaleString()
                    : "N/A"}
                </p>
                {report.reportedUserId?.isBlocked && (
                  <p className="text-gray-600 dark:text-gray-400">
                    Ban Status: User is blocked{" "}
                    {report.reportedUserId?.banExpires
                      ? `until ${new Date(
                          report.reportedUserId.banExpires
                        ).toLocaleString()}`
                      : "permanently"}
                  </p>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleActionClick(report._id, "dismiss")}
                  className={`px-4 py-2 rounded ${
                    report.status === "resolved"
                      ? "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-400 dark:hover:bg-gray-600"
                  }`}
                  disabled={report.status === "resolved"}
                >
                  Dismiss
                </button>
                <button
                  onClick={() => handleActionClick(report._id, "ban", 7)}
                  className={`px-4 py-2 rounded ${
                    report.status === "resolved"
                      ? "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                  disabled={report.status === "resolved"}
                >
                  Ban User (7 Days)
                </button>
                <button
                  onClick={() => handleActionClick(report._id, "ban")}
                  className={`px-4 py-2 rounded ${
                    report.status === "resolved"
                      ? "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "bg-red-700 text-white hover:bg-red-800"
                  }`}
                  disabled={report.status === "resolved"}
                >
                  Ban User (Permanent)
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
