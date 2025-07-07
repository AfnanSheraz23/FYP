import React, { useEffect, useRef, useState } from "react"
import Toast from "./Toast"

const EditQuestionModal = ({
  initialContent = "",
  questionId,
  onSubmit,
  onClose,
}) => {
  const [content, setContent] = useState(initialContent)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState({ message: "", type: "" })
  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    if (!content.trim()) {
      setToast({ message: "Question content cannot be empty.", type: "error" })
      setIsSubmitting(false)
      setTimeout(() => setToast({ message: "", type: "" }), 3000)
      return
    }

    try {
      await onSubmit({ content, questionId })
      setToast({ message: "Question updated successfully!", type: "success" })
      setIsSubmitting(false)
      setContent("")
      onClose()
    } catch (err) {
      console.error("Failed to update question:", err)
      setToast({
        message: `Error updating question: ${err.message}`,
        type: "error",
      })
      setIsSubmitting(false)
    } finally {
      setTimeout(() => setToast({ message: "", type: "" }), 3000)
    }
  }

  // return (
  //   <>
  //     <div className="fixed inset-0 bg-[#00000066] bg-opacity-50 flex items-center justify-center z-50">
  //       <div className="bg-white p-6 rounded-lg shadow-lg h-screen sm:h-auto md:w-[60%] relative">
  //         <button
  //           className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-700 fs-700"
  //           onClick={onClose}
  //         >
  //           ×
  //         </button>

  //         <h2 className="text-xl font-semibold my-5">Edit Question</h2>

  //         <form onSubmit={handleSubmit}>
  //           <textarea
  //             value={content}
  //             ref={textareaRef}
  //             onChange={(e) => setContent(e.target.value)}
  //             rows="4"
  //             placeholder="Start with 'what', 'why', 'how', etc."
  //             className="w-full p-3 border border-gray-300 rounded mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-black"
  //           ></textarea>

  //           <button
  //             type="submit"
  //             className="black-button"
  //             disabled={isSubmitting}
  //           >
  //             Update Question
  //           </button>
  //         </form>
  //       </div>
  //     </div>

  //     {toast.message && (
  //       <Toast
  //         message={toast.message}
  //         type={toast.type}
  //         onClose={() => setToast({ message: "", type: "" })}
  //       />
  //     )}
  //   </>
  // )
  return (
    <>
      <div className="fixed inset-0 bg-[#00000066] dark:bg-[#00000099] bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg h-screen sm:h-auto md:w-[60%] relative">
          <button
            className="absolute top-3 right-3 text-2xl text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 fs-700"
            onClick={onClose}
          >
            ×
          </button>

          <h2 className="text-xl font-semibold my-5 text-gray-900 dark:text-gray-100">
            Edit Question
          </h2>

          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              ref={textareaRef}
              onChange={(e) => setContent(e.target.value)}
              rows="4"
              placeholder="Start with 'what', 'why', 'how', etc."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-gray-300 text-gray-900 dark:text-gray-100"
            ></textarea>

            <button
              type="submit"
              className="black-button"
              disabled={isSubmitting}
            >
              Update Question
            </button>
          </form>
        </div>
      </div>

      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "" })}
        />
      )}
    </>
  )
}

export default EditQuestionModal
