import React, { useEffect, useState } from "react"
import { format } from "timeago.js"
import useQuestionStore from "../store/questionStore"
import useAuthStore from "../store/authStore"
import useChatStore from "../store/chatStore"
import useReportStore from "../store/reportStore"
import { Link } from "react-router-dom"
import defaultImage from "../default_image/blank-profile-picture.png"
import { findChat } from "../api/chatRequests"
import EditQuestionModal from "./EditQuestionModal"
import Toast from "./Toast"

// New ReportQuestionModal component
const ReportQuestionModal = ({ questionId, onSubmit, onClose }) => {
  const [reason, setReason] = useState("")
  const [comment, setComment] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason) {
      alert("Please select a reason for reporting.")
      return
    }
    try {
      await onSubmit({ questionId, reason, comment })
      onClose()
    } catch (err) {
      throw err
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Report Question
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-900 dark:text-gray-100"
              required
            >
              <option value="">Select a reason</option>
              <option value="spam">Spam</option>
              <option value="harassment">Harassment</option>
              <option value="offensive">Offensive Content</option>
              <option value="misinformation">Misinformation</option>
              <option value="other">Other</option>
            </select>
          </div>
          {reason === "other" && (
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Details
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded dark:bg-gray-900 dark:text-gray-100"
                placeholder="Provide additional details"
                rows="4"
              />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function QuestionList() {
  const {
    questions,
    loading,
    error,
    fetchQuestions,
    editQuestion,
    deleteQuestion,
  } = useQuestionStore()
  const { user } = useAuthStore()
  const { createNewChat, setActiveChat } = useChatStore()
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [reportingQuestion, setReportingQuestion] = useState(null)
  const [confirmation, setConfirmation] = useState({
    show: false,
    questionId: null,
  })
  const [toast, setToast] = useState({ message: "", type: "" })
  const [imageModal, setImageModal] = useState({ show: false, imageUrl: "" })

  // Assume useReportStore provides submitReport
  const { submitReport } = useReportStore()

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  const handleMessageClick = async (recipientId) => {
    try {
      const existingChatResponse = await findChat(user._id, recipientId)
      let chat = existingChatResponse.data
      if (chat) {
        setActiveChat(chat)
      } else {
        await createNewChat(user._id, recipientId)
      }
    } catch (err) {
      console.error("Error starting chat:", err.message)
      setToast({ message: "Failed to start chat.", type: "error" })
      setTimeout(() => setToast({ message: "", type: "" }), 3000)
    }
  }

  const handleEditClick = (question) => {
    setEditingQuestion({ id: question._id, content: question.content })
  }

  const handleDeleteClick = (questionId) => {
    setConfirmation({ show: true, questionId })
  }

  const handleReportClick = (questionId) => {
    setReportingQuestion(questionId)
  }

  const confirmDelete = async () => {
    try {
      await deleteQuestion(confirmation.questionId)
      setToast({ message: "Question deleted successfully!", type: "success" })
    } catch (err) {
      console.error("Error deleting question:", err.message)
      setToast({
        message: `Failed to delete question: ${err.message}`,
        type: "error",
      })
    } finally {
      setConfirmation({ show: false, questionId: null })
      setTimeout(() => setToast({ message: "", type: "" }), 3000)
    }
  }

  const cancelDelete = () => {
    setConfirmation({ show: false, questionId: null })
  }

  const handleEditSubmit = async ({ content, questionId }) => {
    try {
      await editQuestion(questionId, content)
    } catch (err) {
      throw err
    }
  }

  const handleReportSubmit = async ({ questionId, reason, comment }) => {
    try {
      await submitReport({ questionId, reason, comment, reporterId: user._id })
      setToast({ message: "Report submitted successfully!", type: "success" })
    } catch (err) {
      console.error("Error submitting report:", err.message)
      setToast({
        message: `Failed to submit report: ${err.message}`,
        type: "error",
      })
    } finally {
      setTimeout(() => setToast({ message: "", type: "" }), 3000)
    }
  }

  const openImageModal = (imageUrl) => {
    setImageModal({ show: true, imageUrl })
  }

  const closeImageModal = () => {
    setImageModal({ show: false, imageUrl: "" })
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>
  if (questions.length === 0) return <div>No questions yet.</div>

  return (
    <>
      {editingQuestion && (
        <EditQuestionModal
          initialContent={editingQuestion.content}
          questionId={editingQuestion.id}
          onSubmit={handleEditSubmit}
          onClose={() => setEditingQuestion(null)}
        />
      )}

      {reportingQuestion && (
        <ReportQuestionModal
          questionId={reportingQuestion}
          onSubmit={handleReportSubmit}
          onClose={() => setReportingQuestion(null)}
        />
      )}

      {confirmation.show && (
        <Toast
          message="Are you sure you want to delete this question?"
          type="confirmation"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "" })}
        />
      )}

      {imageModal.show && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
          <div className="relative">
            <button
              className="absolute top-[-24px] right-[-24px] bg-white dark:bg-gray-800 rounded-full p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              onClick={closeImageModal}
            >
              <i className="fas fa-times text-lg"></i>
            </button>
            <div className="bg-white dark:bg-gray-800 p-2 rounded-lg w-96 h-96">
              <img
                src={imageModal.imageUrl}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = defaultImage
                }}
              />
            </div>
          </div>
        </div>
      )}

      {questions &&
        questions.map((question) => (
          <div
            key={question._id}
            className="bg-white dark:bg-gray-800 p-4 mb-2 sm:mb-5 border-x-0 border-y rounded-none sm:border border-gray-300 dark:border-gray-700 sm:rounded hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <img
                src={
                  question.user?.picture
                    ? `http://localhost:5000${question.user.picture}`
                    : defaultImage
                }
                className="w-10 h-10 rounded-full object-cover cursor-pointer"
                onError={(e) => {
                  e.target.src = defaultImage
                }}
                onClick={() =>
                  openImageModal(
                    question.user?.picture
                      ? `http://localhost:5000${question.user.picture}`
                      : defaultImage
                  )
                }
              />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                <Link
                  to={`/profile/${question.user._id}`}
                  className="text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-400 hover:underline"
                >
                  {question.user.firstname} {question.user.lastname}
                </Link>
              </h3>
              {user && user._id !== question.user._id && (
                <button
                  onClick={() => handleMessageClick(question.user._id)}
                  className="fs-300 text-blue-500 dark:text-blue-400 hover:underline mt-1"
                >
                  Message
                </button>
              )}
              <div className="ml-auto flex gap-2">
                {user &&
                  (user._id === question.user._id || user.role === "admin") && (
                    <>
                      <button
                        onClick={() => handleEditClick(question)}
                        className="fs-300 text-blue-500 dark:text-blue-400 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(question._id)}
                        className="fs-300 text-red-500 dark:text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </>
                  )}
                {user &&
                  user._id !== question.user._id &&
                  user.role !== "admin" && (
                    <button
                      onClick={() => handleReportClick(question._id)}
                      className="fs-300 text-orange-500 dark:text-orange-400 hover:underline"
                    >
                      Report
                    </button>
                  )}
              </div>
            </div>

            <h3 className="mb-1 text-base font-semibold my-5 text-gray-900 dark:text-gray-100">
              <Link
                to={`/questions/${question._id}`}
                className="text-gray-800 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-400 fs-500 hover:underline no-underline"
              >
                {question.content}
              </Link>
            </h3>
            <small className="fs-200 text-gray-500 dark:text-gray-400">
              {format(question.createdAt)}
            </small>
            <p className="fs-300 my-3 text-gray-600 dark:text-gray-400">
              {question.answers?.length || 0} Answers
            </p>
          </div>
        ))}
    </>
  )
}
