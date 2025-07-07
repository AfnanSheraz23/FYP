import { Navigate } from "react-router-dom"
import useAuthStore from "../store/authStore"

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore()

  if (loading) return <div>Redirecting...</div>

  return user ? children : <Navigate to="/auth/login" />
}

export default ProtectedRoute
