import React, { useEffect, useRef, useState } from "react"
import useQuestionStore from "../store/questionStore"

const AnswerModal = ({ questionId }) => {
  const {
    addAnswer,
    editAnswer,
    setModalOpen,
    modalOpen,
    modalMode,
    editingAnswerId,
  } = useQuestionStore()
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const textareaRef = useRef(null)

  // Pre-fill content for editing
  useEffect(() => {
    if (modalMode === "edit" && editingAnswerId) {
      const answer = useQuestionStore
        .getState()
        .currentQuestion?.answers.find((ans) => ans._id === editingAnswerId)
      if (answer) setContent(answer.content)
    } else {
      setContent("")
    }
  }, [modalMode, editingAnswerId])

  // Focus textarea when modal opens
  useEffect(() => {
    if (modalOpen && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [modalOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    try {
      if (modalMode === "edit") {
        await editAnswer(editingAnswerId, content)
      } else {
        await addAnswer(content, questionId)
      }
      setContent("")
      setModalOpen(false)
    } catch (err) {
      console.error(
        `Failed to ${modalMode === "edit" ? "edit" : "add"} answer:`,
        err
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // return (
  //   <div className="px-5 sm:px-0">
  //     {/* Answer Button */}
  //     <button
  //       className="block border-1 rounded ml-auto fs-300 hover:bg-white hover:scale-102 transition duration-200"
  //       onClick={() => setModalOpen(true, "add")}
  //     >
  //       Answer
  //     </button>

  //     {modalOpen && (
  //       <div className="fixed inset-0 bg-[#00000066] bg-opacity-50 flex items-center justify-center z-50">
  //         <div className="bg-white p-6 rounded-lg shadow-lg h-screen sm:h-auto md:w-[60%] relative">
  //           {/* Close Button */}
  //           <button
  //             className="absolute top-0 right-3 text-2xl text-gray-500 hover:text-gray-700 fs-700"
  //             onClick={() => setModalOpen(false)}
  //           >
  //             &times;
  //           </button>

  //           <form className="mt-12" onSubmit={handleSubmit}>
  //             <textarea
  //               ref={textareaRef}
  //               value={content}
  //               onChange={(e) => setContent(e.target.value)}
  //               rows="4"
  //               placeholder="Write your answer here"
  //               className="w-full p-3 border border-gray-300 rounded mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-black"
  //             ></textarea>
  //             <button
  //               type="submit"
  //               className="black-button"
  //               disabled={isSubmitting}
  //             >
  //               {modalMode === "edit" ? "Update Answer" : "Submit Answer"}
  //             </button>
  //           </form>
  //         </div>
  //       </div>
  //     )}
  //   </div>
  // )
  return (
    <div className="px-5 sm:px-0">
      {/* Answer Button */}
      <button
        className="block border-1 rounded ml-auto fs-300 hover:bg-white dark:hover:bg-gray-800 hover:scale-102 transition duration-200"
        onClick={() => setModalOpen(true, "add")}
      >
        Answer
      </button>

      {modalOpen && (
        <div className="fixed inset-0 bg-[#00000066] dark:bg-[#00000099] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg h-screen sm:h-auto md:w-[60%] relative">
            {/* Close Button */}
            <button
              className="absolute top-0 right-3 text-2xl text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 fs-700"
              onClick={() => setModalOpen(false)}
            >
              ×
            </button>

            <form className="mt-12" onSubmit={handleSubmit}>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="4"
                placeholder="Write your answer here"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-gray-300"
              ></textarea>
              <button
                type="submit"
                className="black-button"
                disabled={isSubmitting}
              >
                {modalMode === "edit" ? "Update Answer" : "Submit Answer"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnswerModal
