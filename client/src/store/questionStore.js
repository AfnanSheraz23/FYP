import { create } from "zustand"
import instance from "../axios"

export const useQuestionStore = create((set, get) => ({
  questions: [],
  currentQuestion: null,
  loading: false,
  error: null,
  modalOpen: false,
  modalMode: "add",
  editingAnswerId: null,
  userVotes: [],

  // Fetch all questions
  fetchQuestions: async () => {
    try {
      set({ loading: true, error: null })
      const res = await instance.get("/api/questions")
      set({ questions: res.data, loading: false })
    } catch (error) {
      console.error("Error fetching questions:", error)
      set({
        error: error.response?.data?.message || "Failed to fetch questions",
        loading: false,
      })
    }
  },

  // Fetch a single question by ID
  fetchQuestion: async (id) => {
    set({ loading: true, error: null })
    try {
      const res = await instance.get(`/api/questions/${id}`)
      set({ currentQuestion: res.data, loading: false })

      // Fetch user's votes for question and answers
      const targetIds = [res.data._id, ...res.data.answers.map((a) => a._id)]
      const voteRes = await instance.get("/api/votes/user", {
        params: { targetIds: targetIds.join(","), targetType: "question" },
      })
      set({ userVotes: voteRes.data })
    } catch (error) {
      console.error("Error fetching question:", error)
      set({
        error: error.response?.data?.message || "Failed to fetch question",
        loading: false,
      })
    }
  },

  // Add a new question
  addQuestion: async (content) => {
    try {
      set({ loading: true, error: null })
      const res = await instance.post("/api/questions", { content })
      set((state) => ({
        questions: [res.data.question, ...state.questions],
        loading: false,
      }))
    } catch (error) {
      console.error("Error adding question:", error)
      set({
        error: error.response?.data?.message || "Failed to add question",
        loading: false,
      })
    }
  },

  // Edit a question
  editQuestion: async (questionId, content) => {
    try {
      set({ loading: true, error: null })
      const res = await instance.put(`/api/questions/${questionId}`, {
        content,
      })
      set((state) => ({
        questions: state.questions.map((q) =>
          q._id === questionId ? res.data.question : q
        ),
        currentQuestion:
          state.currentQuestion && state.currentQuestion._id === questionId
            ? res.data.question
            : state.currentQuestion,
        loading: false,
      }))
    } catch (error) {
      console.error("Error editing question:", error)
      set({
        error: error.response?.data?.message || "Failed to edit question",
        loading: false,
      })
    }
  },

  // Delete a question
  deleteQuestion: async (questionId) => {
    try {
      set({ loading: true, error: null })
      await instance.delete(`/api/questions/${questionId}`)
      set((state) => ({
        questions: state.questions.filter((q) => q._id !== questionId),
        currentQuestion:
          state.currentQuestion && state.currentQuestion._id === questionId
            ? null
            : state.currentQuestion,
        loading: false,
      }))
    } catch (error) {
      console.error("Error deleting question:", error)
      set({
        error: error.response?.data?.message || "Failed to delete question",
        loading: false,
      })
    }
  },

  // Add an answer
  addAnswer: async (content, questionId) => {
    try {
      set({ loading: true, error: null })
      const res = await instance.post("/api/answers", { content, questionId })
      set((state) => {
        if (state.currentQuestion && state.currentQuestion._id === questionId) {
          return {
            currentQuestion: {
              ...state.currentQuestion,
              answers: [...state.currentQuestion.answers, res.data.answer],
            },
            loading: false,
          }
        }
        return { loading: false }
      })
    } catch (error) {
      console.error("Error adding answer:", error)
      set({
        error: error.response?.data?.message || "Failed to add answer",
        loading: false,
      })
    }
  },

  // Edit an answer
  editAnswer: async (answerId, content) => {
    try {
      set({ loading: true, error: null })
      const res = await instance.put(`/api/answers/${answerId}`, { content })
      set((state) => {
        if (state.currentQuestion) {
          return {
            currentQuestion: {
              ...state.currentQuestion,
              answers: state.currentQuestion.answers.map((ans) =>
                ans._id === answerId ? res.data.answer : ans
              ),
            },
            loading: false,
          }
        }
        return { loading: false }
      })
    } catch (error) {
      console.error("Error editing answer:", error)
      set({
        error: error.response?.data?.message || "Failed to edit answer",
        loading: false,
      })
    }
  },

  // Delete an answer
  deleteAnswer: async (answerId) => {
    try {
      set({ loading: true, error: null })
      await instance.delete(`/api/answers/${answerId}`)
      set((state) => {
        if (state.currentQuestion) {
          return {
            currentQuestion: {
              ...state.currentQuestion,
              answers: state.currentQuestion.answers.filter(
                (ans) => ans._id !== answerId
              ),
            },
            loading: false,
          }
        }
        return { loading: false }
      })
    } catch (error) {
      console.error("Error deleting answer:", error)
      set({
        error: error.response?.data?.message || "Failed to delete answer",
        loading: false,
      })
    }
  },

  // Vote
  vote: async (targetId, targetType, voteType) => {
    try {
      set({ loading: true, error: null })

      // Optimistically update UI
      const currentQuestion = get().currentQuestion
      const userVotes = get().userVotes
      let updatedQuestion = { ...currentQuestion }
      let updatedVotes = [...userVotes]

      // Find existing vote
      const existingVote = userVotes.find(
        (v) => v.targetId === targetId && v.targetType === targetType
      )

      if (existingVote && existingVote.voteType === voteType) {
        // Remove vote
        updatedVotes = updatedVotes.filter((v) => v._id !== existingVote._id)
        if (targetType === "question") {
          updatedQuestion = {
            ...updatedQuestion,
            [voteType === "upvote" ? "upvoteCount" : "downvoteCount"]:
              (updatedQuestion[
                voteType === "upvote" ? "upvoteCount" : "downvoteCount"
              ] || 0) - 1,
          }
        } else {
          updatedQuestion = {
            ...updatedQuestion,
            answers: updatedQuestion.answers.map((ans) =>
              ans._id === targetId
                ? {
                    ...ans,
                    [voteType === "upvote" ? "upvoteCount" : "downvoteCount"]:
                      (ans[
                        voteType === "upvote" ? "upvoteCount" : "downvoteCount"
                      ] || 0) - 1,
                  }
                : ans
            ),
          }
        }
      } else {
        // Add or switch vote
        if (existingVote) {
          updatedVotes = updatedVotes.filter((v) => v._id !== existingVote._id)
          const oppositeCount =
            existingVote.voteType === "upvote" ? "upvoteCount" : "downvoteCount"
          if (targetType === "question") {
            updatedQuestion = {
              ...updatedQuestion,
              [oppositeCount]: (updatedQuestion[oppositeCount] || 0) - 1,
            }
          } else {
            updatedQuestion = {
              ...updatedQuestion,
              answers: updatedQuestion.answers.map((ans) =>
                ans._id === targetId
                  ? { ...ans, [oppositeCount]: (ans[oppositeCount] || 0) - 1 }
                  : ans
              ),
            }
          }
        }
        updatedVotes.push({
          targetId,
          targetType,
          voteType,
          _id: `temp-${Date.now()}`,
        })
        if (targetType === "question") {
          updatedQuestion = {
            ...updatedQuestion,
            [voteType === "upvote" ? "upvoteCount" : "downvoteCount"]:
              (updatedQuestion[
                voteType === "upvote" ? "upvoteCount" : "downvoteCount"
              ] || 0) + 1,
          }
        } else {
          updatedQuestion = {
            ...updatedQuestion,
            answers: updatedQuestion.answers.map((ans) =>
              ans._id === targetId
                ? {
                    ...ans,
                    [voteType === "upvote" ? "upvoteCount" : "downvoteCount"]:
                      (ans[
                        voteType === "upvote" ? "upvoteCount" : "downvoteCount"
                      ] || 0) + 1,
                  }
                : ans
            ),
          }
        }
      }

      // Apply optimistic update
      set({ currentQuestion: updatedQuestion, userVotes: updatedVotes })

      // Send request
      const res = await instance.post("/api/votes", {
        targetId,
        targetType,
        voteType,
      })

      // Update with actual response
      set((state) => {
        let finalQuestion = { ...state.currentQuestion }
        if (targetType === "question") {
          finalQuestion = { ...finalQuestion, ...res.data }
        } else {
          finalQuestion = {
            ...finalQuestion,
            answers: finalQuestion.answers.map((ans) =>
              ans._id === targetId ? { ...ans, ...res.data } : ans
            ),
          }
        }
        return { currentQuestion: finalQuestion, loading: false }
      })

      // Refresh userVotes
      const voteRes = await instance.get(
        `/api/votes/user?targetIds=${targetId}&targetType=${targetType}`
      )
      set((state) => ({
        userVotes: state.userVotes
          .filter((v) => v.targetId !== targetId)
          .concat(voteRes.data),
      }))
    } catch (error) {
      // Revert optimistic update
      set((state) => {
        const currentQuestion = state.currentQuestion
        const userVotes = state.userVotes
        const existingVote = userVotes.find(
          (v) =>
            v.targetId === targetId &&
            v.targetType === targetType &&
            v._id.startsWith("temp-")
        )
        let revertedQuestion = { ...currentQuestion }
        let revertedVotes = [...userVotes]

        if (existingVote) {
          revertedVotes = revertedVotes.filter(
            (v) => v._id !== existingVote._id
          )
          if (targetType === "question") {
            revertedQuestion = {
              ...revertedQuestion,
              [voteType === "upvote" ? "upvoteCount" : "downvoteCount"]:
                (revertedQuestion[
                  voteType === "upvote" ? "upvoteCount" : "downvoteCount"
                ] || 0) - 1,
            }
          } else {
            revertedQuestion = {
              ...revertedQuestion,
              answers: revertedQuestion.answers.map((ans) =>
                ans._id === targetId
                  ? {
                      ...ans,
                      [voteType === "upvote" ? "upvoteCount" : "downvoteCount"]:
                        (ans[
                          voteType === "upvote"
                            ? "upvoteCount"
                            : "downvoteCount"
                        ] || 0) - 1,
                    }
                  : ans
              ),
            }
          }
        }

        return {
          currentQuestion: revertedQuestion,
          userVotes: revertedVotes,
          error: error.response?.data?.message || "Error voting",
          loading: false,
        }
      })
      throw error
    }
  },

  // Toggle modal
  setModalOpen: (open, mode = "add", answerId = null) => {
    set({
      modalOpen: open,
      modalMode: mode,
      editingAnswerId: answerId,
      error: null,
    })
  },
}))

export default useQuestionStore
