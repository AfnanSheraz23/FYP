import { useEffect, useRef, useState } from "react"
import { BiChevronLeft } from "react-icons/bi"
import { FiSend } from "react-icons/fi"
import InputEmoji from "react-input-emoji"
import { format } from "timeago.js"
import useChatStore from "../store/chatStore"
import defaultImage from "../default_image/blank-profile-picture.png"

export default function ChatBox({ setIsOpen }) {
  const {
    activeChat,
    messages,
    sendMessage,
    setActiveChat,
    handleReceivedMessage,
    currentUserId,
    checkOnlineStatus,
    receivedMessage,
  } = useChatStore()
  const scrollRef = useRef()
  const containerRef = useRef()
  const chatBoxRef = useRef() // Ref for the ChatBox container
  const [newMessage, setNewMessage] = useState("")

  // Handle sending message
  const handleSend = (text = newMessage) => {
    if (text.trim()) {
      sendMessage(text)
      setNewMessage("")
    }
  }

  // Set scroll position to bottom when chat opens
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [activeChat])

  // Maintain scroll position at bottom for new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Handle received messages
  useEffect(() => {
    if (receivedMessage) {
      handleReceivedMessage()
    }
  }, [receivedMessage, handleReceivedMessage, messages])

  // Handle clicks outside the ChatBox
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatBoxRef.current && !chatBoxRef.current.contains(event.target)) {
        setActiveChat(null)
        setIsOpen(true)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [setActiveChat, setIsOpen])

  return (
    <div
      ref={chatBoxRef}
      className="bg-white dark:bg-gray-800 w-72 h-[400px] shadow-xl rounded-b-md flex flex-col"
    >
      {/* Header with Back */}
      <div className="p-2 flex items-center space-x-2">
        <button
          onClick={() => {
            setActiveChat(null)
            setIsOpen(true)
          }}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
        >
          <BiChevronLeft size={20} />
        </button>
        <img
          src={
            activeChat?.userData?.picture
              ? `http://localhost:5000${activeChat.userData.picture}`
              : defaultImage
          }
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <span className="font-medium text-gray-900 dark:text-white">
            {activeChat?.userData?.firstname} {activeChat?.userData?.lastname}
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {checkOnlineStatus(activeChat) ? "Online" : "Offline"}
          </p>
        </div>
      </div>
      <hr style={{ border: "0.1px solid #ececec" }} />

      {/* Messages */}
      <div
        ref={containerRef}
        className="flex-1 p-3 overflow-y-auto space-y-2 no-scrollbar"
      >
        {messages.map((msg, index) => (
          <div
            key={msg._id || index}
            ref={index === messages.length - 1 ? scrollRef : null}
            className={`p-2 rounded-lg max-w-[70%] ${
              msg.senderId === currentUserId
                ? "bg-blue-500 ml-auto"
                : "bg-gray-500 dark:bg-gray-700"
            }`}
          >
            <span className="fs-300 text-white">{msg.text}</span>
            <span className="text-xs block mt-1 opacity-70 text-white dark:text-gray-100">
              {format(msg.createdAt)}
            </span>
          </div>
        ))}
      </div>

      <hr style={{ border: "0.1px solid #ececec" }} />
      {/* Input */}
      <div className="flex px-2 gap-1 md:gap-2 items-center pt-2">
        <InputEmoji
          value={newMessage}
          onChange={setNewMessage}
          onEnter={handleSend}
          placeholder="Message ..."
        />
        <button onClick={handleSend} className="black-button">
          <FiSend />
        </button>
      </div>
    </div>
  )
}
