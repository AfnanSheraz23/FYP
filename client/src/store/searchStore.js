import { create } from "zustand"
import instance from "../axios"

export const useSearchStore = create((set) => ({
  results: { questions: [], answers: [], users: [] },
  loading: false,
  error: null,

  search: async (keyword) => {
    try {
      set({ loading: true, error: null })
      const res = await instance.get("/api/search", {
        params: { keyword },
      })
      set({ results: res.data, loading: false })
      return res.data
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error searching",
        loading: false,
      })
      throw error
    }
  },

  clearResults: () => {
    set({ results: { questions: [], answers: [], users: [] }, error: null })
  },
}))
