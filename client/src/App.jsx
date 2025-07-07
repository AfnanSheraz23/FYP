import { Routes, Route } from "react-router-dom"
import { useEffect } from "react"
import useAuthStore from "./store/authStore"

import Login from "./Pages/Login"
import SignUp from "./Pages/SignUp"
import SelectInterests from "./Pages/SelectInterests"
import Layout from "./Layout"
import Home from "./Pages/Home"
import QuestionDetails from "./main-components/QuestionDetails"
import MyQuestion from "./Pages/MyQuestion"
import Profile from "./Pages/Profile"
import EditProfile from "./main-components/EditProfile"
import About from "./Pages/About"
import Notifications from "./Pages/Notifications"
import NotFound from "./Pages/NotFound"
import GuestRoute from "./main-components/GuestRoute"
import ProtectedRoute from "./main-components/ProtectedRoute"
import AdminRoute from "./main-components/AdminRoute"
import AdminDashboard from "./Pages/AdminDashboard"
import ResetPassword from "./Pages/ResetPassword"
import ForgotPassword from "./Pages/ForgotPassword"

function App() {
  const fetchUser = useAuthStore((state) => state.fetchUser)

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route
          path="/auth/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <ForgotPassword />
            </GuestRoute>
          }
        />

        <Route
          path="/auth/register"
          element={
            <GuestRoute>
              <SignUp />
            </GuestRoute>
          }
        />
        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route path="/" element={<Home />} />
          <Route path="/questions/:id" element={<QuestionDetails />} />
          <Route path="/interest-selection" element={<SelectInterests />} />
          <Route path="/my-questions" element={<MyQuestion />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/about" element={<About />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
