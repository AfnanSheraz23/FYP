import { useState, useEffect, useRef } from "react"
import { Link, NavLink } from "react-router-dom"
import ProfileDropdown from "./ProfileDropdown"
import NotificationDropdown from "./NotificationDropdown"
import ThemeToggle from "./ThemeToggle"
import { useSearchStore } from "../store/searchStore"
import Logo from "../default_image/logo.jpg"
import defaultImage from "../default_image/blank-profile-picture.png"
import { FaCommentAlt, FaQuestionCircle } from "react-icons/fa"

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { search, results, loading, error, clearResults } = useSearchStore()
  const dropdownRef = useRef(null)

  // Close search popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSearchOpen(false)
        clearResults()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [clearResults])

  // Debounced search function
  useEffect(() => {
    if (!searchQuery.trim()) {
      clearResults()
      return
    }

    const debounce = setTimeout(async () => {
      try {
        console.log("Triggering search for query:", searchQuery)
        await search(searchQuery)
      } catch (err) {
        console.error("Search API error:", err.message)
      }
    }, 300)

    return () => clearTimeout(debounce)
  }, [searchQuery, search])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    try {
      console.log("Manual search triggered for query:", searchQuery)
      await search(searchQuery)
    } catch (err) {
      console.error("Manual search error:", err.message)
    }
  }

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value)
    if (!e.target.value.trim()) {
      clearResults()
    }
  }

  const hasResults =
    results.questions?.length > 0 ||
    results.answers?.length > 0 ||
    results.users?.length > 0

  return (
    <header className="bg-white dark:bg-gray-800 px-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 flex flex-col md:flex-row md:justify-between md:items-center md:flex-wrap z-10">
      <Link to="/">
        <img
          src={Logo}
          className="hidden sm:block w-40 rounded cursor-pointer mx-auto my-0"
          alt="Logo"
        />
      </Link>

      {/* Search Bar (Visible on md and above) */}
      <div className="hidden md:flex md:items-center md:justify-center relative">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search ..."
            value={searchQuery}
            onChange={handleInputChange}
            className="md:p-[7px] md:w-[250px] md:border-none md:rounded outline-none text-gray-900 bg-gray-100 dark:text-gray-100 dark:bg-gray-700"
          />
          <button className="ml-[5px] border dark:border-black black-button">
            <i className="fas fa-search"></i>
          </button>
        </form>
        {(hasResults || loading || error) && (
          <div
            ref={dropdownRef}
            className="absolute top-12 left-0 w-[300px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg z-20 max-h-96 overflow-y-auto"
          >
            {loading && (
              <div className="text-sm p-2 text-gray-900 dark:text-gray-100">
                Searching...
              </div>
            )}
            {error && (
              <div className="text-sm p-2 text-red-500 dark:text-red-400">
                {error}
              </div>
            )}
            {!loading && !error && (
              <>
                {results.questions?.length > 0 && (
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                      Questions
                    </h3>
                    {results.questions.map((question) => (
                      <Link
                        key={question._id}
                        to={`/questions/${question._id}`}
                        className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => {
                          setSearchQuery("")
                          clearResults()
                        }}
                      >
                        <FaQuestionCircle className="text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                            {question.content}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {results.answers?.length > 0 && (
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                      Answers
                    </h3>
                    {results.answers.map((answer) => (
                      <Link
                        key={answer._id}
                        to={`/questions/${answer.questionId}`}
                        className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => {
                          setSearchQuery("")
                          clearResults()
                        }}
                      >
                        <FaCommentAlt className="text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                            {answer.content.substring(0, 50)}...
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            By {answer.user?.firstname} {answer.user?.lastname}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {results.users?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                      Users
                    </h3>
                    {results.users.map((user) => (
                      <Link
                        key={user._id}
                        to={`/profile/${user._id}`}
                        className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => {
                          setSearchQuery("")
                          clearResults()
                        }}
                      >
                        <img
                          src={
                            user.picture
                              ? `http://localhost:5000${user.picture}`
                              : defaultImage
                          }
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = defaultImage
                          }}
                          alt="User profile"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {user.firstname} {user.lastname}
                            {user.username && (
                              <span className="text-gray-600 dark:text-gray-400">
                                {" "}
                                (@{user.username})
                              </span>
                            )}
                          </p>
                          {user.interests?.length > 0 && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {user.interests.join(", ")}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
            {!loading && !error && !hasResults && searchQuery.trim() && (
              <div className="text-sm p-2 text-gray-600 dark:text-gray-400">
                No results found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Nav Links (Large screens only) */}
      <nav className="hidden md:flex md:items-center">
        <ProfileDropdown />
        <NotificationDropdown />
        <ThemeToggle />
      </nav>

      {/* Small Screen Icon Row with Collapsible Search */}
      <div className="flex justify-between items-center w-full md:hidden mt-[10px] relative">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `text-xl ${
              isActive
                ? "text-[#e0a800] dark:text-[#e0a800]"
                : "text-black dark:text-white"
            }`
          }
        >
          <i className="fa-solid fa-house"></i>
        </NavLink>
        <NavLink
          to="/questions"
          className={({ isActive }) =>
            `text-xl ${
              isActive
                ? "text-[#e0a800] dark:text-[#e0a800]"
                : "text-black dark:text-white"
            }`
          }
        >
          <i className="fa-solid fa-circle-question"></i>
        </NavLink>
        <div className="relative">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="text-black dark:text-white text-xl"
          >
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
          {isSearchOpen && (
            <div
              ref={dropdownRef}
              className="absolute top-[50px] left-[-120px] w-[300px] bg-white dark:bg-gray-800 p-[10px] rounded-[5px] shadow-lg z-20"
            >
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search ..."
                  value={searchQuery}
                  onChange={handleInputChange}
                  className="p-[7px] w-[200px] border border-gray-300 dark:border-gray-600 rounded text-black dark:text-gray-100 bg-white dark:bg-gray-700"
                />
                <button className="ml-[5px] border bg-black dark:bg-gray-900 text-white dark:text-gray-100 rounded hover:bg-white dark:hover:bg-gray-800 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-gray-600">
                  <i className="fas fa-search"></i>
                </button>
              </form>
              {(hasResults || loading || error) && (
                <div className="mt-2 max-h-96 overflow-y-auto">
                  {loading && (
                    <div className="text-sm p-2 text-gray-900 dark:text-gray-100">
                      Searching...
                    </div>
                  )}
                  {error && (
                    <div className="text-sm p-2 text-red-500 dark:text-red-400">
                      {error}
                    </div>
                  )}
                  {!loading && !error && (
                    <>
                      {results.questions?.length > 0 && (
                        <div className="border-b border-gray-200 dark:border-gray-700">
                          <h3 className="text-sm font-semibold p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                            Questions
                          </h3>
                          {results.questions.map((question) => (
                            <Link
                              key={question._id}
                              to={`/questions/${question._id}`}
                              className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => {
                                setSearchQuery("")
                                clearResults()
                                setIsSearchOpen(false)
                              }}
                            >
                              <i className="fas fa-circle-question text-gray-600 dark:text-gray-400"></i>
                              <div>
                                <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                                  {question.content}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                  {question.description?.substring(0, 50)}...
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                      {results.answers?.length > 0 && (
                        <div className="border-b border-gray-200 dark:border-gray-700">
                          <h3 className="text-sm font-semibold p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                            Answers
                          </h3>
                          {results.answers.map((answer) => (
                            <Link
                              key={answer._id}
                              to={`/questions/${answer.questionId}`}
                              className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => {
                                setSearchQuery("")
                                clearResults()
                                setIsSearchOpen(false)
                              }}
                            >
                              <i className="fas fa-comment text-gray-600 dark:text-gray-400"></i>
                              <div>
                                <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                                  {answer.content.substring(0, 50)}...
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  By {answer.user?.firstname}{" "}
                                  {answer.user?.lastname}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                      {results.users?.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                            Users
                          </h3>
                          {results.users.map((user) => (
                            <Link
                              key={user._id}
                              to={`/users/${user._id}`}
                              className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => {
                                setSearchQuery("")
                                clearResults()
                                setIsSearchOpen(false)
                              }}
                            >
                              <img
                                src={
                                  user.picture
                                    ? `http://localhost:5000${user.picture}`
                                    : defaultImage
                                }
                                className="w-8 h-8 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.src = defaultImage
                                }}
                                alt="User profile"
                              />
                              <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  {user.firstname} {user.lastname}
                                  {user.username && (
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {" "}
                                      (@{user.username})
                                    </span>
                                  )}
                                </p>
                                {user.interests?.length > 0 && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {user.interests.join(", ")}
                                  </p>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  {!loading && !error && !hasResults && searchQuery.trim() && (
                    <div className="text-sm p-2 text-gray-600 dark:text-gray-400">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <ProfileDropdown />
        <NotificationDropdown />
        <ThemeToggle />
      </div>
    </header>
  )
}

export default Header
