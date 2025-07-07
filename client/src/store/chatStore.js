import { create } from "zustand"
import { io } from "socket.io-client"
import { userChats, createChat } from "../api/chatRequests"
import { getMessages, addMessage } from "../api/messageRequests"
import { getUser } from "../api/userRequests"

const useChatStore = create((set, get) => ({
  socket: null,
  chats: [],
  activeChat: null,
  messages: [],
  onlineUsers: [],
  receivedMessage: null,
  currentUserId: null,
  loading: false,
  error: null,

  // Initialize socket and user
  initializeSocket: (userId) => {
    const socket = io("ws://localhost:8800")
    set({ socket, currentUserId: userId })

    socket.emit("add-user", userId)
    socket.on("get-users", (users) => {
      set({ onlineUsers: users })
    })

    socket.on("get-message", (data) => {
      set({ receivedMessage: data })
    })
  },

  createNewChat: async (senderId, receiverId) => {
    try {
      const response = await createChat({ senderId, receiverId })
      await get().fetchChats(senderId) // Refetch chats to update the list
      set({ activeChat: response.data })
      return response.data
    } catch (error) {
      console.error(
        "Error creating chat:",
        error.response?.data || error.message
      )
      throw error
    }
  },

  // Fetch user chats and user data for each chat
  fetchChats: async (userId) => {
    try {
      const { data: chats } = await userChats(userId)
      const chatsWithUserData = await Promise.all(
        chats.map(async (chat) => {
          const otherUserId = chat.members.find((id) => id !== userId)
          try {
            const { data: userData } = await getUser(otherUserId)
            return {
              ...chat,
              userData: {
                id: userData._id,
                name: `${userData.firstname} ${userData.lastname}`,
                avatar: userData.picture,
              },
            }
          } catch (error) {
            console.error(
              `Error fetching user data for user ${otherUserId}:`,
              error
            )
            return { ...chat, userData: null }
          }
        })
      )
      set({ chats: chatsWithUserData })
    } catch (error) {
      console.error("Error fetching chats:", error)
    }
  },

  // Set active chat and fetch messages
  setActiveChat: async (chatOrId) => {
    set({ loading: true, error: null })
    try {
      let chat
      if (typeof chatOrId === "string") {
        // Fetch chat by ID via API
        const { data: userChatsData } = await userChats(get().currentUserId)
        chat = userChatsData.find((c) => c._id === chatOrId)
        if (!chat) {
          throw new Error("Chat not found")
        }
      } else {
        chat = chatOrId // Use provided chat object
      }

      // Set active chat and reset messages
      set({ activeChat: chat, messages: [] })

      if (chat) {
        // Fetch messages
        const { data: messages } = await getMessages(chat._id)
        set({ messages })

        // Fetch user data for the other member
        const userId =
          chat.members && Array.isArray(chat.members)
            ? chat.members.find((id) => id !== get().currentUserId)
            : null
        if (userId) {
          const { data: userData } = await getUser(userId)
          set({ activeChat: { ...chat, userData } })
        } else {
          set({ activeChat: { ...chat, userData: null } })
        }
      }
      set({ loading: false })
    } catch (error) {
      console.error("Error fetching messages or user data:", error) // Line ~96
      set({ error: error.message, loading: false })
    }
  },

  // Send message
  sendMessage: async (message) => {
    const { activeChat, currentUserId, socket } = get()
    const receiverId = activeChat?.members.find((id) => id !== currentUserId)
    const messageData = {
      senderId: currentUserId,
      text: message,
      chatId: activeChat._id,
      receiverId,
    }
    // Send to socket
    socket?.emit("send-message", messageData)

    // Save to database
    try {
      const { data } = await addMessage({
        senderId: currentUserId,
        text: message,
        chatId: activeChat._id,
      })
      set((state) => ({
        messages: [...state.messages, data],
      }))
    } catch (error) {
      console.error("Error sending message:", error)
    }
  },

  // Handle received message
  handleReceivedMessage: () => {
    const { receivedMessage, activeChat, messages } = get()
    if (
      receivedMessage &&
      activeChat &&
      receivedMessage.chatId === activeChat._id
    ) {
      set({ messages: [...messages, receivedMessage], receivedMessage: null })
    }
  },

  // Check online status
  checkOnlineStatus: (chat) => {
    if (!chat || !chat.members || !Array.isArray(chat.members)) {
      return false // Prevent find on undefined
    }
    const { onlineUsers, currentUserId } = get()
    const chatMember = chat.members.find((member) => member !== currentUserId) // Line ~144
    return chatMember
      ? onlineUsers.some((user) => user.userId === chatMember)
      : false
  },
}))

export default useChatStore
