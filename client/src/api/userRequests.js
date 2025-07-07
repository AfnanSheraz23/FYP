import instance from "../axios"

export const getUser = (userId) => instance.get(`/api/user/${userId}`)
export const updateUser = (id, formData) =>
  instance.put(`/api/user/${id}`, formData)
