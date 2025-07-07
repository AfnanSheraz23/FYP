import { useEffect, useState } from "react"
import { format } from "timeago.js"
import useQuestionStore from "../store/questionStore"
import useAuthStore from "../store/authStore"
import { Link } from "react-router-dom"
import defaultImage from "../default_image/blank-profile-picture.png"
import QuestionModal from "../main-components/QuestionModal"
import Toast from "../main-components/Toast"
import EditQuestionModal from "../main-components/EditQuestionModal"

export default function MyQuestion() {
  const {
    questions,
    loading,
    error,
    fetchQuestions,
    editQuestion,
    deleteQuestion,
  } = useQuestionStore()
  const { user } = useAuthStore()
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [confirmation, setConfirmation] = useState({
    show: false,
    questionId: null,
  })
  const [toast, setToast] = useState({ message: "", type: "" })

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  const handleEditClick = (question) => {
    setEditingQuestion({ id: question._id, content: question.content })
  }

  const handleDeleteClick = (questionId) => {
    setConfirmation({ show: true, questionId })
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

  useEffect(() => {
    fetchQuestions() // Fetch all questions on mount
  }, [fetchQuestions])

  // Filter questions by the authenticated user's ID
  const myQuestions =
    questions?.filter(
      (question) => question.user._id.toString() === user?._id?.toString()
    ) || []

  if (loading) return <div className="text-center fs-400">Loading...</div>
  if (error) return <div className="text-red-500 fs-400">{error}</div>
  if (myQuestions.length === 0)
    return <div className="fs-400">You haven't asked any questions yet.</div>

  // return (
  //   <>
  //     <div className="px-5 sm:px-0">
  //       <QuestionModal />

  //       <h2 className="my-5 fs-600 font-bold">Questions By You</h2>
  //       {editingQuestion && (
  //         <EditQuestionModal
  //           initialContent={editingQuestion.content}
  //           questionId={editingQuestion.id}
  //           onSubmit={handleEditSubmit}
  //           onClose={() => setEditingQuestion(null)}
  //         />
  //       )}
  //       {confirmation.show && (
  //         <Toast
  //           message="Are you sure you want to delete this question?"
  //           type="confirmation"
  //           onConfirm={confirmDelete}
  //           onCancel={cancelDelete}
  //         />
  //       )}

  //       {toast.message && (
  //         <Toast
  //           message={toast.message}
  //           type={toast.type}
  //           onClose={() => setToast({ message: "", type: "" })}
  //         />
  //       )}

  //       {myQuestions.map((question) => (
  //         <div
  //           key={question._id}
  //           className="bg-white p-4 mb-2 sm:mb-5 border-x-0 border-y rounded-none sm:border border-gray-300 sm:rounded hover:shadow-md"
  //         >
  //           <div className="flex items-center gap-4">
  //             {question.user?.picture && question.user.picture !== "" ? (
  //               <img
  //                 src={`http://localhost:5000${question.user.picture}`}
  //                 className="w-10 h-10 rounded-full object-cover"
  //                 onError={(e) => {
  //                   e.target.src = defaultImage
  //                 }}
  //               />
  //             ) : (
  //               <img
  //                 src={defaultImage}
  //                 className="w-10 h-10 rounded-full object-cover"
  //               />
  //             )}

  //             <h3 className="font-semibold">
  //               {question.user.firstname} {question.user.lastname}
  //             </h3>
  //             {user &&
  //               (user._id === question.user._id || user.role === "admin") && (
  //                 <div className="ml-auto flex gap-2">
  //                   <button
  //                     onClick={() => handleEditClick(question)}
  //                     className="fs-300 text-blue-500 hover:underline"
  //                   >
  //                     Edit
  //                   </button>
  //                   <button
  //                     onClick={() => handleDeleteClick(question._id)}
  //                     className="fs-300 text-red-500 hover:underline"
  //                   >
  //                     Delete
  //                   </button>
  //                 </div>
  //               )}
  //           </div>

  //           <h3 className="mb-1 text-base font-semibold my-5">
  //             <Link
  //               to={`/questions/${question._id}`}
  //               className="text-gray-800 hover:text-gray-600 fs-500 hover:underline no-underline"
  //             >
  //               {question.content}
  //             </Link>
  //           </h3>
  //           <small className="fs-200">{format(question.createdAt)}</small>
  //           <p className="fs-300 my-3">
  //             {question.answers?.length || 0} Answers
  //           </p>
  //         </div>
  //       ))}
  //     </div>
  //   </>
  // )
  return (
    <>
      <div className="px-5 sm:px-0">
        <QuestionModal />

        <h2 className="my-5 fs-600 font-bold text-gray-900 dark:text-gray-100">
          Questions By You
        </h2>
        {editingQuestion && (
          <EditQuestionModal
            initialContent={editingQuestion.content}
            questionId={editingQuestion.id}
            onSubmit={handleEditSubmit}
            onClose={() => setEditingQuestion(null)}
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

        {myQuestions.map((question) => (
          <div
            key={question._id}
            className="bg-white dark:bg-gray-800 p-4 mb-2 sm:mb-5 border-x-0 border-y rounded-none sm:border border-gray-300 dark:border-gray-700 sm:rounded hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              {question.user?.picture && question.user.picture !== "" ? (
                <img
                  src={`http://localhost:5000${question.user.picture}`}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = defaultImage
                  }}
                />
              ) : (
                <img
                  src={defaultImage}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}

              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {question.user.firstname} {question.user.lastname}
              </h3>
              {user &&
                (user._id === question.user._id || user.role === "admin") && (
                  <div className="ml-auto flex gap-2">
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
                  </div>
                )}
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
      </div>
    </>
  )
}
