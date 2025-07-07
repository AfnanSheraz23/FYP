import { useEffect, useRef, useState } from "react"
import { FaChevronUp, FaComment } from "react-icons/fa"
import { FaX } from "react-icons/fa6"

import useAuthStore from "../store/authStore"

import ChatBox from "./ChatBox"

import defaultImage from "../default_image/blank-profile-picture.png"
import useChatStore from "../store/chatStore"

export default function MessageWidget() {
  const [search, setSearch] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700)

  const { user } = useAuthStore()
  const {
    chats,
    activeChat,
    fetchChats,
    setActiveChat,
    initializeSocket,
    checkOnlineStatus,
  } = useChatStore()

  const iconRef = useRef(null)

  // Initialize socket and fetch chats
  useEffect(() => {
    if (user?._id) {
      initializeSocket(user._id)
      fetchChats(user._id)
    }
  }, [user?._id, initializeSocket, fetchChats])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 700)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Handle click outside to close widget
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (iconRef.current && !iconRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  // Filter chats based on search
  const filteredChats = chats.filter((chat) => {
    const otherMember = chat.userData?.name || ""
    return otherMember.toLowerCase().includes(search.toLowerCase())
  })

  // return (
  //   <div
  //     className="fixed bottom-4 right-4 z-50 flex flex-col items-end"
  //     ref={iconRef}
  //   >
  //     {/* Chat List Modal */}
  //     {isOpen && !activeChat && (
  //       <div className="bg-white w-72 h-[400px] shadow-xl rounded-b-md overflow-hidden">
  //         <input
  //           type="text"
  //           placeholder="Search messages"
  //           className="rounded pl-4 py-3 text-sm outline-none w-50 "
  //           value={search}
  //           onChange={(e) => setSearch(e.target.value)}
  //         />

  //         <hr style={{ border: "0.1px solid #ececec" }} />

  //         <div className="overflow-y-auto h-[calc(100%-48px)]">
  //           {filteredChats.map((chat) => (
  //             <div
  //               key={chat._id}
  //               className="flex items-center p-3 cursor-pointer hover:bg-gray-100"
  //               onClick={() => {
  //                 setActiveChat(chat)
  //                 setIsOpen(false)
  //               }}
  //             >
  //               <div className="relative">
  //                 <img
  //                   src={
  //                     chat.userData?.avatar
  //                       ? `http://localhost:5000${chat.userData.avatar}`
  //                       : defaultImage
  //                   }
  //                   alt="Profile"
  //                   className="w-10 h-10 rounded-full object-cover mr-2"
  //                 />
  //                 {checkOnlineStatus(chat) && (
  //                   <span className="absolute top-0 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
  //                 )}
  //               </div>
  //               <div>
  //                 <span className="font-medium">{chat.userData?.name}</span>
  //               </div>
  //             </div>
  //           ))}
  //         </div>
  //       </div>
  //     )}

  //     {/* ChatBox */}
  //     {activeChat && <ChatBox setIsOpen={setIsOpen} />}

  //     {/* Message Icon (Mobile) */}
  //     {isMobile ? (
  //       <button
  //         onClick={() => {
  //           setIsOpen(!isOpen)
  //           if (activeChat) setActiveChat(null)
  //         }}
  //         className="bg-white p-3 rounded-full shadow-md"
  //       >
  //         {isOpen || activeChat ? <FaX size={20} /> : <FaComment size={20} />}
  //       </button>
  //     ) : (
  //       <div
  //         className="flex items-center justify-between bg-white shadow-md p-2 rounded-t-md w-72 cursor-pointer"
  //         onClick={() => {
  //           setIsOpen(!isOpen)
  //           if (activeChat) setActiveChat(null)
  //         }}
  //       >
  //         <div className="flex items-center space-x-2">
  //           <div className="relative">
  //             {user?.picture ? (
  //               <img
  //                 src={`http://localhost:5000${user.picture}`}
  //                 alt="profile"
  //                 className="w-10 h-10 rounded-full object-cover mr-2"
  //               />
  //             ) : (
  //               <img
  //                 src={defaultImage}
  //                 className="w-10 h-10 rounded-full object-cover mr-2"
  //               />
  //             )}
  //           </div>
  //           <span className="font-medium">Messaging</span>
  //         </div>
  //         <div className="flex space-x-2">
  //           <FaChevronUp
  //             className={`text-gray-600 text-sm transition-transform ${
  //               isOpen ? "rotate-180" : ""
  //             }`}
  //           />
  //         </div>
  //       </div>
  //     )}
  //   </div>
  // )
  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col items-end"
      ref={iconRef}
    >
      {/* Chat List Modal */}
      {isOpen && !activeChat && (
        <div className="bg-white dark:bg-gray-800 w-72 h-[400px] shadow-xl rounded-b-md overflow-hidden">
          <input
            type="text"
            placeholder="Search messages"
            className="rounded pl-4 py-3 text-sm outline-none w-50 bg-white dark:bg-transparent text-gray-900 dark:text-gray-100"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <hr style={{ border: "0.1px solid #ececec" }} />

          <div className="overflow-y-auto h-[calc(100%-48px)]">
            {filteredChats.map((chat) => (
              <div
                key={chat._id}
                className="flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  setActiveChat(chat)
                  setIsOpen(false)
                }}
              >
                <div className="relative">
                  <img
                    src={
                      chat.userData?.avatar
                        ? `http://localhost:5000${chat.userData.avatar}`
                        : defaultImage
                    }
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover mr-2"
                  />
                  {checkOnlineStatus(chat) && (
                    <span className="absolute top-0 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                  )}
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {chat.userData?.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ChatBox */}
      {activeChat && <ChatBox setIsOpen={setIsOpen} />}

      {/* Message Icon (Mobile) */}
      {isMobile ? (
        <button
          onClick={() => {
            setIsOpen(!isOpen)
            if (activeChat) setActiveChat(null)
          }}
          className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-md"
        >
          {isOpen || activeChat ? (
            <FaX size={20} className="text-gray-900 dark:text-gray-100" />
          ) : (
            <FaComment size={20} className="text-gray-900 dark:text-gray-100" />
          )}
        </button>
      ) : (
        <div
          className="flex items-center justify-between bg-white dark:bg-gray-800 shadow-md p-2 rounded-t-md w-72 cursor-pointer"
          onClick={() => {
            setIsOpen(!isOpen)
            if (activeChat) setActiveChat(null)
          }}
        >
          <div className="flex items-center space-x-2">
            <div className="relative">
              {user?.picture ? (
                <img
                  src={`http://localhost:5000${user.picture}`}
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover mr-2"
                />
              ) : (
                <img
                  src={defaultImage}
                  className="w-10 h-10 rounded-full object-cover mr-2"
                />
              )}
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Messaging
            </span>
          </div>
          <div className="flex space-x-2">
            <FaChevronUp
              className={`text-gray-600 dark:text-gray-400 text-sm transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      )}
    </div>
  )
}
