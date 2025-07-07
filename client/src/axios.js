import axios from "axios"

const instance = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true, //  enable sending cookies
})

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 403 &&
      error.response?.data?.message === "Account is blocked" &&
      window.location.pathname !== "/auth/login" // Prevent redirect if already on login page
    ) {
      localStorage.removeItem("token")
      window.location.href = "/auth/login"
    }
    return Promise.reject(error)
  }
)

export default instance
