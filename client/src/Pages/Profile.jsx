import { NavLink, useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import useAuthStore from "../store/authStore"
import instance from "../axios" // Import axios instance
import defaultImage from "../default_image/blank-profile-picture.png"
import QuestionTab from "../main-components/QuestionTab"
import AnswerTab from "../main-components/AnswerTab"

const Profile = () => {
  const { user: loggedInUser } = useAuthStore()
  const { userId } = useParams() // Get userId from URL
  const [profileUser, setProfileUser] = useState(null)
  const [activeTab, setActiveTab] = useState("questions")
  const [questionCount, setQuestionCount] = useState(0)
  const [answerCount, setAnswerCount] = useState(0)
  const [loadingCounts, setLoadingCounts] = useState(true)
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true)
        if (userId) {
          // Fetch user profile by userId
          const response = await instance.get(`/api/user/${userId}`)
          setProfileUser(response.data)
        } else {
          // Default to logged-in user
          setProfileUser(loggedInUser)
        }
        setLoadingProfile(false)
      } catch (err) {
        console.error("Fetch Profile Error:", err)
        setLoadingProfile(false)
      }
    }

    fetchProfile()
  }, [userId, loggedInUser])

  useEffect(() => {
    const fetchCounts = async () => {
      if (!profileUser?._id) return // Skip if profileUser is not loaded
      try {
        setLoadingCounts(true)
        // Fetch questions count
        const questionsRes = await instance.get("/api/questions", {
          params: { userId: profileUser._id },
        })
        // Fetch answers count
        const answersRes = await instance.get("/api/answers", {
          params: { userId: profileUser._id },
        })
        setQuestionCount(questionsRes.data.length)
        setAnswerCount(
          answersRes.data.filter((answer) => answer.question).length
        ) // Only count answers with valid questions
        setLoadingCounts(false)
      } catch (err) {
        console.error("Fetch Counts Error:", err)
        setLoadingCounts(false)
      }
    }

    if (profileUser) {
      fetchCounts()
    }
  }, [profileUser])

  if (loadingProfile) return <div>Loading profile...</div>
  if (!profileUser) return <div>User not found.</div>

  return (
    <div>
      <div className="px-5 sm:px-0">
        {loggedInUser?._id === profileUser._id && (
          <button className="block border-1 rounded ml-auto fs-300 hover:bg-gray-300 dark:hover:bg-gray-700">
            <NavLink to="/edit-profile">Edit Profile</NavLink>
          </button>
        )}
      </div>

      <div className="w-full p-6 shadow-lg rounded-xl min-h-[80%] mx-auto mt-10 bg-white dark:bg-gray-800">
        {/* Profile Card */}
        <div className="flex items-center gap-4 mb-4">
          {profileUser?.picture ? (
            <img
              src={`http://localhost:5000${profileUser.picture}`}
              alt="profile"
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <img src={defaultImage} className="w-20 h-20 rounded-full" />
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {profileUser.firstname} {profileUser.lastname}
            </h2>
          </div>
        </div>
        {/* Description */}
        <div className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
          <p>{profileUser.bio}</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-500 dark:border-gray-600 pb-2 mb-4 text-sm">
          <button
            onClick={() => setActiveTab("questions")}
            className={`mr-4 ${
              activeTab === "questions"
                ? "text-red-500 dark:text-red-400"
                : "text-gray-500 dark:text-gray-400"
            } hover:text-red-400 dark:hover:text-red-300`}
          >
            <span className="font-semibold">{questionCount}</span> Questions
          </button>
          <button
            onClick={() => setActiveTab("answers")}
            className={`${
              activeTab === "answers"
                ? "text-red-500 dark:text-red-400"
                : "text-gray-500 dark:text-gray-400"
            } hover:text-red-400 dark:hover:text-red-300`}
          >
            <span className="font-semibold">{answerCount}</span> Answers
          </button>
        </div>
        {/* Tab Content */}
        <div>
          {activeTab === "questions" ? (
            <QuestionTab userId={profileUser._id} />
          ) : (
            <AnswerTab userId={profileUser._id} />
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
