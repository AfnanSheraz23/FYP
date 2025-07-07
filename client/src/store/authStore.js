import { create } from "zustand"
import instance from "../axios"

const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,

  fetchUser: async () => {
    set({ loading: true })
    try {
      const res = await instance.get("/api/auth/me")
      set({ user: res.data, loading: false })
    } catch (err) {
      console.error("Fetch User Error:", err)
      set({ user: null, loading: false })
    }
  },

  fetchUserProfile: async (id) => {
    try {
      set({ loading: true, error: null })
      const res = await instance.get(`/api/user/${id}`)
      set({ loading: false })
      return res.data
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error fetching profile",
        loading: false,
      })
      throw error
    }
  },

  updateProfile: async (profileData, pictureFile) => {
    try {
      set({ loading: true, error: null })
      const formData = new FormData()
      if (pictureFile) {
        formData.append("picture", pictureFile)
      }
      Object.entries(profileData).forEach(([key, value]) => {
        if (key === "interests" && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, value)
        }
      })

      const res = await instance.post("/api/user/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      set((state) => ({ user: { ...state.user, ...res.data }, loading: false }))
      return res.data
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error updating profile",
        loading: false,
      })
      throw error
    }
  },

  logout: async () => {
    try {
      await instance.post("/api/auth/logout")
      set({ user: null })
    } catch (err) {
      console.error("Logout Error:", err)
    }
  },

  setUser: (user) => set({ user }), // useful for instant update after login
}))

export default useAuthStore
