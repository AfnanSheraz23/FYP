import { NavLink } from "react-router-dom"

const Sidebar = () => {
  return (
    <aside className="sticky top-25 hidden h-[80vh] md:w-3/12 lg:w-1/5 bg-white dark:bg-gray-800 p-5 border-r border-gray-300 dark:border-gray-700 md:flex flex-col justify-between">
      <ul className="list-none">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `block text-gray-800 dark:text-gray-100 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded ${
                isActive
                  ? "bg-gray-100 dark:bg-gray-700"
                  : "bg-white dark:bg-gray-800"
              }`
            }
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/my-questions"
            className={({ isActive }) =>
              `block text-gray-800 dark:text-gray-100 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded ${
                isActive
                  ? "bg-gray-100 dark:bg-gray-700"
                  : "bg-white dark:bg-gray-800"
              }`
            }
          >
            Questions
          </NavLink>
        </li>
      </ul>

      <ul className="list-none text-xs">
        <li>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `block text-gray-800 dark:text-gray-100 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded ${
                isActive
                  ? "bg-gray-100 dark:bg-gray-700"
                  : "bg-white dark:bg-gray-800"
              }`
            }
          >
            About
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/privacy-policy"
            className={({ isActive }) =>
              `block text-gray-800 dark:text-gray-100 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded ${
                isActive
                  ? "bg-gray-100 dark:bg-gray-700"
                  : "bg-white dark:bg-gray-800"
              }`
            }
          >
            Contact Us
          </NavLink>
        </li>
      </ul>
    </aside>
  )
}

export default Sidebar
