import useAuthStore from "../store/authStore"

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuthStore()

  if (loading) return <div>Redirecting...</div>
  if (!user) {
    // Not logged in
    return <Navigate to="/login" /> // Redirect to login page
  }

  if (user.role !== "admin") {
    // Logged in, but not an admin
    // return (
    //   <div className="text-center mt-8">
    //     <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
    //     <p className="text-gray-700">
    //       You do not have permission to access this page.
    //     </p>
    //   </div>
    // )
    return (
      <div className="text-center mt-8">
        <h1 className="text-2xl font-bold text-red-500 dark:text-red-400">
          Access Denied
        </h1>
        <p className="text-gray-700 dark:text-gray-300">
          You do not have permission to access this page.
        </p>
      </div>
    )
  }

  // Logged in and is an admin, render the children (admin components)
  return children
}

export default AdminRoute
