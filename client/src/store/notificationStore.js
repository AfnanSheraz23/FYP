import { create } from "zustand"
import PocketBase from "pocketbase"

const pb = new PocketBase("http://localhost:8090")

const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  fetchNotifications: async (userId) => {
    const records = await pb.collection("notifications").getFullList({
      filter: `userId="${userId}"`,
      sort: "-created",
    })
    set({
      notifications: records,
      unreadCount: records.filter((n) => !n.read).length,
    })
  },
  updateNotification: (notificationId, updates) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, ...updates } : n
      ),
      unreadCount: state.notifications.filter((n) =>
        n.id === notificationId ? !updates.read : !n.read
      ).length,
    }))
  },
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.read
        ? state.unreadCount
        : state.unreadCount + 1,
    }))
  },
  resetUnreadCount: () => {
    set({ unreadCount: 0 })
  },
  markNotificationsReadByChatId: async (chatId) => {
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.chatId === chatId
          ? { ...notification, read: true }
          : notification
      ),
      unreadCount: state.notifications.filter((n) =>
        n.chatId === chatId ? false : !n.read
      ).length,
    }))

    // Update backend
    try {
      const unreadNotifications = await pb
        .collection("notifications")
        .getList(1, 50, {
          filter: `chatId="${chatId}" && read = false`,
        })

      await Promise.all(
        unreadNotifications.items.map((notification) =>
          pb.collection("notifications").update(notification.id, { read: true })
        )
      )
    } catch (err) {
      console.error("Error updating notifications for chatId in backend:", err)
    }
  },
}))

export default useNotificationStore
