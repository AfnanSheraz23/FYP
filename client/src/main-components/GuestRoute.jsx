// src/components/GuestRoute.jsx
import React, { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import instance from "../axios"
import useAuthStore from "../store/authStore"

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuthStore()

  if (loading) return <div>Redirecting...</div>

  return user ? <Navigate to="/" /> : children
}

// const GuestRoute = ({ children }) => {
//   const [checking, setChecking] = useState(true)
//   const [authenticated, setAuthenticated] = useState(false)

//   useEffect(() => {
//     instance
//       .get("/me")
//       .then(() => setAuthenticated(true))
//       .catch(() => setAuthenticated(false))
//       .finally(() => setChecking(false))
//   }, [])

//   if (checking) return <div>Checking auth...</div>

//   return authenticated ? <Navigate to="/" /> : children
// }

export default GuestRoute
