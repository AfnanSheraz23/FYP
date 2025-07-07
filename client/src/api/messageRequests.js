import instance from "../axios"

export const getMessages = (id) => instance.get(`/api/message/${id}`)

export const addMessage = (data) => instance.post("/api/message/", data)
