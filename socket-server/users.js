const { trimStr } = require("./utils");
// модаль
let users = [];
// поиск человечка
const findUser = (user) => {
  const userName = trimStr(user.name);
  const userRoom = trimStr(user.room);

  return users.find(
    (u) => trimStr(u.name) === userName && trimStr(u.room) === userRoom
  );
};
// добавление человечка
const addUser = (user) => {
  const isExist = findUser(user);

  !isExist && users.push(user);

  const currentUser = isExist || user;

  return { isExist: !!isExist, user: currentUser };
};
// добовления комнаты
const getRoomUsers = (room) => users.filter((u) => u.room === room);
// ливнул
const removeUser = (user) => {
  const found = findUser(user);

  if (found) {
    users = users.filter(
      ({ room, name }) => room === found.room && name !== found.name
    );
  }

  return found;
};

module.exports = { addUser, findUser, getRoomUsers, removeUser };
