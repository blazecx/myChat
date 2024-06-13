const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();

const route = require("./route");
const { addUser, findUser, getRoomUsers, removeUser } = require("./users");

app.use(cors({ origin: "*" }));
app.use(route);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Чел если заходит

io.on("connection", (socket) => {
  socket.on("join", ({ name, room }) => {
    socket.join(room);

    const { user, isExist } = addUser({ name, room });
// Приветсвие пользователя, проверка был ли он тут снова или нет(СЕРЫЙ СДЕЛАЙ НА ФРОНТЕ НЕ ЗАБУДЬ)
    const userMessage = isExist
      ? `${user.name}, Опять ты тут`
      : `Ассалям Алейкум ${user.name}`;

    socket.emit("message", {
      data: { user: { name: "Админ" }, message: userMessage },
    });
// такой вариант заходи первичного
    socket.broadcast.to(user.room).emit("message", {
      data: { user: { name: "Админ" }, message: `${user.name} зашёл к нам` },
    });
// проверка комнаты
    io.to(user.room).emit("room", {
      data: { users: getRoomUsers(user.room) },
    });
  });
// отправка сообщения
  socket.on("sendMessage", ({ message, params }) => {
    const user = findUser(params);

    if (user) {
      io.to(user.room).emit("message", { data: { user, message } });
    }
  });
// функции когда пользователь ливнул
  socket.on("leftRoom", ({ params }) => {
    const user = removeUser(params);

    if (user) {
      const { room, name } = user;

      io.to(room).emit("message", {
        data: { user: { name: "Админ" }, message: `${name} ливнул от сюда` },
      });

      io.to(room).emit("room", {
        data: { users: getRoomUsers(room) },
      });
    }
  });

  io.on("disconnect", () => {
    console.log("Disconnect");
  });
});

server.listen(5000, () => {
  console.log("Server is running");
});
