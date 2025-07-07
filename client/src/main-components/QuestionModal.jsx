import React, { useEffect, useRef, useState } from "react"
import Toast from "./Toast"
import useQuestionStore from "../store/questionStore"

const QuestionModal = () => {
  const [content, setContent] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState({ message: "", type: "" })
  const { addQuestion } = useQuestionStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    if (!content.trim()) return

    try {
      await addQuestion(content)
      setToast({ message: "Question added successfully!", type: "success" })
      setIsSubmitting(false) // Submission finished
      setContent("")
      closeModal()
    } catch (err) {
      console.error("Failed to submit post:", err)
      setIsSubmitting(false)
      setToast({ message: "Error adding question.", type: "error" })
    } finally {
      setTimeout(() => {
        setToast({ message: "", type: "" })
      }, 3000)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e)
    }
  }

  const textareaRef = useRef(null)

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isOpen])

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  return (
    <div>
      {/* Ask Question Button */}
      <button
        className="block border-1 rounded ml-auto fs-300 hover:bg-white dark:hover:bg-gray-800 hover:scale-102 transition duration-200"
        onClick={openModal}
      >
        Ask Question
      </button>

      {/* QuestionModal */}
      {isOpen && (
        <div className="fixed inset-0 bg-[#00000066] dark:bg-[#00000099] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg h-screen sm:h-auto md:w-[60%] relative">
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-2xl text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 fs-700"
              onClick={closeModal}
            >
              ×
            </button>

            <h2 className="text-xl font-semibold my-5 text-gray-900 dark:text-gray-100">
              Tips for asking a good question
            </h2>

            <ul className="list-disc pl-5 mb-4 text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>Keep your question short and to the point,</li>
              <li>Double-check grammar and spelling,</li>
            </ul>

            <form onSubmit={handleSubmit}>
              <textarea
                value={content}
                ref={textareaRef}
                onChange={(e) => setContent(e.target.value)}
                rows="4"
                placeholder="Start with 'what', 'why', 'how', etc."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-gray-300 text-gray-900 dark:text-gray-100"
              ></textarea>

              <button type="submit" className="black-button">
                Add Question
              </button>
            </form>
          </div>
        </div>
      )}

      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "" })}
        />
      )}
    </div>
  )
}

export default QuestionModal
