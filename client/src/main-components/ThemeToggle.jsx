// import { useState, useEffect } from "react"
// import { FaSun, FaMoon } from "react-icons/fa"

// function ThemeToggle() {
//   const [isDarkMode, setIsDarkMode] = useState(() => {
//     // Check localStorage or system preference on mount
//     const savedTheme = localStorage.getItem("theme")
//     return savedTheme
//       ? savedTheme === "dark"
//       : window.matchMedia("(prefers-color-scheme: dark)").matches
//   })

//   useEffect(() => {
//     // Apply or remove 'dark' class on html element
//     if (isDarkMode) {
//       document.documentElement.classList.add("dark")
//       localStorage.setItem("theme", "dark")
//     } else {
//       document.documentElement.classList.remove("dark")
//       localStorage.setItem("theme", "light")
//     }
//   }, [isDarkMode])

//   const toggleTheme = () => {
//     setIsDarkMode(!isDarkMode)
//   }

//   return (
//     <button
//       onClick={toggleTheme}
//       className="flex items-center justify-center p-2 rounded-full text-gray-500 dark:text-gray-100 hover:scale-105  transition duration-300"
//     >
//       {isDarkMode ? <FaSun size={28} /> : <FaMoon size={28} />}
//     </button>
//   )
// }

// export default ThemeToggle

import { useState, useEffect } from "react"
import { FaSun, FaMoon } from "react-icons/fa"

function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme")
    return savedTheme
      ? savedTheme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  useEffect(() => {
    // Only update localStorage when isDarkMode changes
    localStorage.setItem("theme", isDarkMode ? "dark" : "light")
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    // Directly toggle the class on document.documentElement
    document.documentElement.classList.toggle("dark")
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center p-2 rounded-full text-gray-500 dark:text-gray-100 hover:scale-105 transition duration-300"
    >
      {isDarkMode ? <FaSun size={28} /> : <FaMoon size={28} />}
    </button>
  )
}

export default ThemeToggle
