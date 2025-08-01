const io = require("socket.io")(8800, {
  cors: {
    origin: "http://localhost:5173",
  },
})

let activeUsers = []

io.on("connection", (socket) => {
  // add new User
  socket.on("add-user", (newUserId) => {
    // if user is not added previously
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({ userId: newUserId, socketId: socket.id })

      console.log("New User Connected", activeUsers)
    }
    // send all active users to new user
    io.emit("get-users", activeUsers)
  })

  // send message to a specific user
  socket.on("send-message", (data) => {
    const { receiverId } = data
    const user = activeUsers.find((user) => user.userId === receiverId)
    if (user) {
      io.to(user.socketId).emit("get-message", data)
    }
  })

  socket.on("disconnect", () => {
    // remove user from active users
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id)

    console.log("User Disconnected", activeUsers)
    // send all active users to all users
    io.emit("get-users", activeUsers)
  })
})
