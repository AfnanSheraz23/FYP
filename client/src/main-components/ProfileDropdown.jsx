import { useState, useRef, useEffect } from "react"
import { NavLink } from "react-router-dom"
import LogoutButton from "./LogoutButton"
import useAuthStore from "../store/authStore"
import defaultImage from "../default_image/blank-profile-picture.png"

const ProfileDropdown = () => {
  const { user } = useAuthStore()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // return (
  //   <div className="relative" ref={dropdownRef}>
  //     {/* Trigger Button */}
  //     <button
  //       onClick={() => setOpen((prev) => !prev)}
  //       className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded hover:bg-gray-100 hover:scale-105 hover:shadow transition duration-200"
  //     >
  //       {user?.picture ? (
  //         <img
  //           src={`http://localhost:5000${user.picture}`}
  //           alt="profile"
  //           className="w-10 h-10 rounded-full object-cover"
  //         />
  //       ) : (
  //         <img
  //           src={defaultImage}
  //           alt="default profile"
  //           className="w-10 h-10 rounded-full object-cover"
  //         />
  //       )}
  //     </button>

  //     {/* Dropdown Content */}
  //     {open && (
  //       <div className="absolute right-0 mt-2 w-56 bg-white shadow-md rounded-lg z-99 p-4 flex flex-col items-center space-y-3">
  //         <div className="flex items-center gap-2">
  //           {user?.picture ? (
  //             <img
  //               src={`http://localhost:5000${user.picture}`}
  //               alt="profile"
  //               className="w-10 h-10 rounded-full object-cover"
  //             />
  //           ) : (
  //             <img src={defaultImage} className="w-20 h-20 rounded-full" />
  //           )}
  //           <p className="text-gray-900 font-semibold ">
  //             {user.firstname} {user.lastname}
  //           </p>
  //         </div>
  //         <button
  //           onClick={() => setOpen(false)}
  //           className="w-full black-button"
  //         >
  //           <NavLink to="/profile">View Profile</NavLink>
  //         </button>
  //         <LogoutButton />
  //       </div>
  //     )}
  //   </div>
  // )
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded hover:scale-105 transition duration-200"
      >
        {user?.picture ? (
          <img
            src={`http://localhost:5000${user.picture}`}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <img
            src={defaultImage}
            alt="default profile"
            className="w-10 h-10 rounded-full object-cover"
          />
        )}
      </button>

      {/* Dropdown Content */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 shadow-md rounded-lg z-99 p-4 flex flex-col items-center space-y-3">
          <div className="flex items-center gap-2">
            {user?.picture ? (
              <img
                src={`http://localhost:5000${user.picture}`}
                alt="profile"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <img src={defaultImage} className="w-20 h-20 rounded-full" />
            )}
            <p className="text-gray-900 dark:text-gray-100 font-semibold">
              {user.firstname} {user.lastname}
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-full black-button"
          >
            <NavLink to="/profile">View Profile</NavLink>
          </button>
          <LogoutButton />
        </div>
      )}
    </div>
  )
}

export default ProfileDropdown
