import instance from "../axios"

export const createChat = (data) => instance.post("/api/chat/", data)

export const userChats = (userId) => instance.get(`/api/chat/${userId}`)

export const findChat = (firstId, secondId) =>
  instance.get(`/api/chat/find/${firstId}/${secondId}`)
