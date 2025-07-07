import useAuthStore from "../store/authStore"
import { useNavigate } from "react-router-dom"

const LogoutButton = () => {
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      console.log("logout success")
      navigate("/auth/login")
    } catch (err) {
      console.error("Logout error:", err)
    }
  }

  return (
    <button className="black-button" onClick={handleLogout}>
      Logout
    </button>
  )
}

export default LogoutButton
