import { useEffect, useRef, useState } from "react"
import { FaBell } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { format } from "timeago.js"
import useNotificationStore from "../store/notificationStore"
import useAuthStore from "../store/authStore"
import useChatStore from "../store/chatStore"
import PocketBase from "pocketbase"

const pb = new PocketBase("http://localhost:8090")

const subscribeToNotifications = (userId, onNotification, activeChatId) => {
  pb.collection("notifications").subscribe("*", function (e) {
    if (e.record.userId === userId) {
      const chatId = e.record.chatId || null
      if (!chatId || chatId !== activeChatId) {
        onNotification(e.record, e.action)
      }
    }
  })
}

function NotificationItem({ notification, setIsOpen }) {
  const navigate = useNavigate()
  const { setActiveChat } = useChatStore()
  const { updateNotification, markNotificationsReadByChatId } =
    useNotificationStore()

  const handleClick = async () => {
    try {
      await markNotificationsReadByChatId(notification.chatId)
      if (notification.link) {
        if (notification.link.includes("chatId")) {
          const chatId = new URLSearchParams(
            notification.link.split("?")[1]
          ).get("chatId")
          if (chatId) {
            await setActiveChat(chatId)
          }
        } else {
          navigate(notification.link)
        }
      }
    } catch (err) {
      console.error("Error handling notification click:", err)
    }
    setIsOpen(false)
  }

  // return (
  //   <div
  //     className={`p-3 cursor-pointer hover:bg-gray-100 ${
  //       notification.read ? "bg-white" : "bg-blue-200"
  //     }`}
  //     onClick={handleClick}
  //   >
  //     <span className={notification.read ? "text-gray-600" : "font-medium"}>
  //       {notification.content}
  //     </span>
  //     <span className="block text-xs text-gray-500">
  //       <small className="fs-200">{format(notification.created)}</small>
  //     </span>
  //   </div>
  // )
  return (
    <div
      className={`p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
        notification.read
          ? "bg-white dark:bg-gray-800"
          : "bg-blue-200 dark:bg-blue-900"
      }`}
      onClick={handleClick}
    >
      <span
        className={
          notification.read
            ? "text-gray-600 dark:text-gray-400"
            : "font-medium text-gray-900 dark:text-gray-100"
        }
      >
        {notification.content}
      </span>
      <span className="block text-xs text-gray-500 dark:text-gray-400">
        <small className="fs-200">{format(notification.created)}</small>
      </span>
    </div>
  )
}

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuthStore()
  const { activeChat } = useChatStore()
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    addNotification,
    updateNotification,
    resetUnreadCount,
  } = useNotificationStore()
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  // Reset unread count when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      resetUnreadCount()
    }
  }, [isOpen, resetUnreadCount])

  useEffect(() => {
    if (user?._id) {
      fetchNotifications(user._id)
      subscribeToNotifications(
        user._id,
        (notification, action) => {
          if (action === "create") {
            addNotification(notification)
          } else if (action === "update") {
            updateNotification(notification.id, notification)
          }
        },
        activeChat?._id
      )
    }
    return () => {
      pb.collection("notifications").unsubscribe("*")
    }
  }, [
    user?._id,
    fetchNotifications,
    addNotification,
    updateNotification,
    activeChat?._id,
  ])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  // return (
  //   <div className="relative" ref={dropdownRef}>
  //     <button
  //       onClick={() => setIsOpen(!isOpen)}
  //       className="relative cursor-pointer px-3 py-2 rounded hover:bg-gray-100 hover:scale-105 hover:shadow transition duration-200"
  //     >
  //       <FaBell size={30} className="text-gray-500" />
  //       {unreadCount > 0 && (
  //         <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-2 py-1">
  //           {unreadCount}
  //         </span>
  //       )}
  //     </button>
  //     {isOpen && (
  //       <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-md overflow-hidden z-50">
  //         <div className="flex items-center justify-between p-3 border-b">
  //           <span className="font-medium">Notifications</span>
  //           <button
  //             onClick={() => {
  //               setIsOpen(false)
  //               navigate("/notifications")
  //             }}
  //             className="text-sm text-blue-500"
  //           >
  //             View All
  //           </button>
  //         </div>
  //         <div className="max-h-64 overflow-y-auto">
  //           {notifications.length === 0 ? (
  //             <div className="p-3 text-gray-500">No notifications</div>
  //           ) : (
  //             notifications.map((n, index) => (
  //               <NotificationItem
  //                 key={index}
  //                 notification={n}
  //                 setIsOpen={setIsOpen}
  //               />
  //             ))
  //           )}
  //         </div>
  //       </div>
  //     )}
  //   </div>
  // )
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative cursor-pointer px-3 py-2 rounded   hover:scale-105 transition duration-200"
      >
        <FaBell size={30} className="text-gray-500 dark:text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 dark:bg-red-600 text-white dark:text-gray-100 text-xs rounded-full px-2 py-1">
            {unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 shadow-xl rounded-md overflow-hidden z-50">
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Notifications
            </span>
            <button
              onClick={() => {
                setIsOpen(false)
                navigate("/notifications")
              }}
              className="text-sm text-blue-500 dark:text-blue-400"
            >
              View All
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-3 text-gray-500 dark:text-gray-400">
                No notifications
              </div>
            ) : (
              notifications.map((n, index) => (
                <NotificationItem
                  key={index}
                  notification={n}
                  setIsOpen={setIsOpen}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
