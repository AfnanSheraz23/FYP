import { create } from "zustand"
import instance from "../axios"
const useReportStore = create((set) => ({
  reports: [],
  loading: false,
  error: null,
  submitReport: async ({ questionId, reason, comment, reporterId }) => {
    try {
      const response = await instance.post("/api/reports", {
        questionId,
        reason,
        comment,
        reporterId,
      })
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to submit report"
      )
    }
  },
  fetchReports: async (status) => {
    set({ loading: true, error: null, reports: [] }) // Reset reports to [] on fetch
    try {
      const response = await instance.get("/api/reports", {
        params: { status },
      })
      set({ reports: response.data || [], loading: false })
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch reports",
        loading: false,
        reports: [], // Ensure reports is always an array
      })
    }
  },
  updateReport: async (reportId, { status, action, banDuration }) => {
    try {
      const response = await instance.patch(`/api/reports/${reportId}`, {
        status,
        action,
        banDuration,
      })
      set((state) => ({
        reports: state.reports.map((report) =>
          report._id === reportId ? { ...report, status } : report
        ),
      }))
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update report"
      )
    }
  },
}))

export default useReportStore
