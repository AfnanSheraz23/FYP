import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import AnswerModal from "./AnswerModal"
import { format } from "timeago.js"
import { findChat } from "../api/chatRequests"
import Toast from "./Toast"

import useQuestionStore from "../store/questionStore"
import useAuthStore from "../store/authStore"
import useChatStore from "../store/chatStore"

import defaultImage from "../default_image/blank-profile-picture.png"

const QuestionDetails = () => {
  const { id } = useParams()
  const {
    currentQuestion,
    loading,
    error,
    fetchQuestion,
    setModalOpen,
    deleteAnswer,
    vote,
    userVotes,
  } = useQuestionStore()

  const { user } = useAuthStore()
  const { createNewChat, setActiveChat } = useChatStore()
  const [confirmation, setConfirmation] = useState({
    show: false,
    answerId: null,
  })
  const [toast, setToast] = useState({ message: "", type: "" })
  const [expandedAnswers, setExpandedAnswers] = useState({})
  const [imageModal, setImageModal] = useState({ show: false, imageUrl: "" })

  useEffect(() => {
    fetchQuestion(id)
  }, [id, fetchQuestion])

  useEffect(() => {
    if (error) {
      setToast({ message: error, type: "error" })
      const timer = setTimeout(() => {
        setToast({ message: "", type: "" })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [error])

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
    }
  }

  const handleVote = async (targetId, targetType, voteType) => {
    if (
      user?._id ===
      (targetType === "question"
        ? currentQuestion.user._id
        : currentQuestion.answers.find((a) => a._id === targetId)?.user._id)
    ) {
      setToast({
        message: `You cannot vote on your own ${targetType}`,
        type: "error",
      })
      setTimeout(() => setToast({ message: "", type: "" }), 3000)
      return
    }
    try {
      await vote(targetId, targetType, voteType)
    } catch (err) {
      console.error(err.message)
      setToast({ message: "Failed to vote.", type: "error" })
      setTimeout(() => setToast({ message: "", type: "" }), 3000)
    }
  }

  const handleDeleteAnswer = async (answerId) => {
    setConfirmation({ show: true, answerId })
  }

  const confirmDelete = async () => {
    try {
      await deleteAnswer(confirmation.answerId)
      setToast({ message: "Answer deleted successfully!", type: "success" })
    } catch (err) {
      console.error("Error deleting answer:", err.message)
      setToast({
        message: `Failed to delete answer: ${err.message}`,
        type: "error",
      })
    } finally {
      setConfirmation({ show: false, answerId: null })
      setTimeout(() => setToast({ message: "", type: "" }), 3000)
    }
  }

  const cancelDelete = () => {
    setConfirmation({ show: false, answerId: null })
  }

  const getVoteClass = (targetId, targetType, voteType) => {
    const userVote = userVotes.find(
      (v) =>
        v.targetId === targetId &&
        v.targetType === targetType &&
        v.voteType === voteType
    )
    if (!userVote) return ""
    return `voted ${
      voteType === "upvote"
        ? "text-blue-500 dark:text-blue-400"
        : "text-red-500 dark:text-red-400"
    }`
  }

  const toggleAnswerExpansion = (answerId) => {
    setExpandedAnswers((prev) => ({
      ...prev,
      [answerId]: !prev[answerId],
    }))
  }

  const openImageModal = (imageUrl) => {
    setImageModal({ show: true, imageUrl })
  }

  const closeImageModal = () => {
    setImageModal({ show: false, imageUrl: "" })
  }

  const shouldTruncate = (content) => {
    const lineCount = content.trim().split("\n").length
    return lineCount > 5
  }

  const getTruncatedContent = (content) => {
    const lines = content.trim().split("\n")
    return lines.slice(0, 5).join("\n")
  }

  if (loading) return <div className="text-center fs-400">Loading...</div>
  if (!currentQuestion) return <div className="fs-400">No question found</div>

  return (
    <>
      <div className="mb-4">
        <h3 className="mb-2 text-base font-semibold fs-500 whitespace-nowrap overflow-hidden text-ellipsis text-gray-900 dark:text-gray-100">
          {currentQuestion.content}
        </h3>
        <p className="fs-300 text-gray-600 dark:text-gray-400">
          Asked by {currentQuestion.user.firstname}{" "}
          {currentQuestion.user.lastname}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <button
            className={`fs-300 flex items-center gap-1 transition-transform duration-200 ${
              getVoteClass(currentQuestion._id, "question", "upvote").includes(
                "voted"
              )
                ? "text-blue-500 dark:text-blue-400 scale-110"
                : "text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
            }`}
            onClick={() =>
              handleVote(currentQuestion._id, "question", "upvote")
            }
            disabled={user?._id === currentQuestion.user._id}
            title={
              user?._id === currentQuestion.user._id
                ? "Cannot vote on your own question"
                : ""
            }
          >
            <i className="fas fa-arrow-up"></i>
            <span>{currentQuestion.upvoteCount || 0}</span>
          </button>
          <button
            className={`fs-300 flex items-center gap-1 transition-transform duration-200 ${
              getVoteClass(
                currentQuestion._id,
                "question",
                "downvote"
              ).includes("voted")
                ? "text-red-500 dark:text-red-400 scale-110"
                : "text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
            }`}
            onClick={() =>
              handleVote(currentQuestion._id, "question", "downvote")
            }
            disabled={user?._id === currentQuestion.user._id}
            title={
              user?._id === currentQuestion.user._id
                ? "Cannot vote on your own question"
                : ""
            }
          >
            <i className="fas fa-arrow-down"></i>
          </button>
        </div>
      </div>
      <hr />
      <AnswerModal questionId={currentQuestion._id} />
      <h4 className="mt-4 mb-2 font-semibold text-gray-900 dark:text-gray-100">
        Answers
      </h4>
      {currentQuestion.answers.length === 0 ? (
        <p className="fs-300 text-gray-600 dark:text-gray-400">
          No answers yet
        </p>
      ) : (
        currentQuestion.answers.map((answer, i) => (
          <div
            key={i}
            className="ANSWER bg-white dark:bg-gray-800 p-4 mb-2 sm:mb-5 border-x-0 border-y rounded sm:border-none border-gray-300 dark:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <img
                src={
                  answer.user?.picture
                    ? `http://localhost:5000${answer.user.picture}`
                    : defaultImage
                }
                className="w-10 h-10 rounded-full object-cover cursor-pointer"
                onError={(e) => {
                  e.target.src = defaultImage
                }}
                onClick={() =>
                  openImageModal(
                    answer.user?.picture
                      ? `http://localhost:5000${answer.user.picture}`
                      : defaultImage
                  )
                }
              />
              <Link
                to={`/profile/${answer.user._id}`}
                className="text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-400 hover:underline"
              >
                {answer.user.firstname} {answer.user.lastname}
              </Link>
              {/* <h3 className="my-3 font-semibold text-gray-900 dark:text-gray-100">
                {answer.user.firstname} {answer.user.lastname}
              </h3> */}
              {user && user._id !== answer.user._id && (
                <button
                  disabled={user._id === answer.user._id}
                  onClick={() => handleMessageClick(answer.user._id)}
                  className="fs-300 text-blue-500 dark:text-blue-400 hover:underline mt-1"
                >
                  Message
                </button>
              )}
              {(user?._id === answer.user._id || user?.role === "admin") && (
                <div className="flex items-center gap-2 mt-2 ml-auto">
                  <button
                    className="fs-300 text-blue-500 dark:text-blue-400 hover:underline"
                    onClick={() => setModalOpen(true, "edit", answer._id)}
                  >
                    Edit
                  </button>
                  <button
                    className="fs-300 text-red-500 dark:text-red-400 hover:underline"
                    onClick={() => handleDeleteAnswer(answer._id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            <small className="fs-200 text-gray-500 dark:text-gray-400">
              {format(answer.createdAt)}
            </small>
            <p className="text-gray-800 dark:text-gray-100 my-3 whitespace-pre-wrap">
              {expandedAnswers[answer._id] || !shouldTruncate(answer.content)
                ? answer.content.trim()
                : getTruncatedContent(answer.content)}
            </p>
            {shouldTruncate(answer.content) && (
              <button
                className="fs-300 text-blue-500 dark:text-blue-400 hover:underline"
                onClick={() => toggleAnswerExpansion(answer._id)}
              >
                {expandedAnswers[answer._id] ? "See Less" : "See More"}
              </button>
            )}
            <div className="flex items-center gap-2">
              <button
                className={`fs-300 flex items-center gap-1 transition-transform duration-200 ${
                  getVoteClass(answer._id, "answer", "upvote").includes("voted")
                    ? "text-blue-500 dark:text-blue-400 scale-110"
                    : "text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                }`}
                onClick={() => handleVote(answer._id, "answer", "upvote")}
                disabled={user?._id === answer.user._id}
                title={
                  user?._id === answer.user._id
                    ? "Cannot vote on your own answer"
                    : ""
                }
              >
                <i className="fas fa-arrow-up"></i>
                <span>{answer.upvoteCount || 0}</span>
              </button>
              <button
                className={`fs-300 flex items-center gap-1 transition-transform duration-200 ${
                  getVoteClass(answer._id, "answer", "downvote").includes(
                    "voted"
                  )
                    ? "text-red-500 dark:text-red-400 scale-110"
                    : "text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                }`}
                onClick={() => handleVote(answer._id, "answer", "downvote")}
                disabled={user?._id === answer.user._id}
                title={
                  user?._id === answer.user._id
                    ? "Cannot vote on your own answer"
                    : ""
                }
              >
                <i className="fas fa-arrow-down"></i>
              </button>
            </div>
          </div>
        ))
      )}
      {confirmation.show && (
        <Toast
          message="Are you sure you want to delete this answer?"
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
    </>
  )
}

export default QuestionDetails
