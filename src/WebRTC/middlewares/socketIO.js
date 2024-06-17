function socketUTKOnline(io, socket, roomName) {
  var kitRooms = io.sockets.adapter.rooms;
  var kitRoom = kitRooms.get(roomName);
  if (kitRoom === undefined) {
    socket.join(roomName);
    socket.emit("UTK-available");
  } else if (kitRoom.size === 1) {
    socket.emit("UTK-error", roomName);
    console.log("Kit is not available: ", roomName);
  } else {
    socket.emit("UTK-error", roomName);
    console.log("Kit is not available: ", roomName);
  }
  console.log("KIT Rooms:");
  console.log(kitRooms);
}

function socketUSEROnline(io, socket, roomName) {
  var rooms = io.sockets.adapter.rooms;
  var room = rooms.get(roomName);
  if (room === undefined) {
    console.log("KIT not available: ", roomName);
    socket.emit("kit-not-available", roomName);
  } else if (room.size === 1) {
    socket.join(roomName);
    socket.emit("user-access-success");
    console.log("User access success: ", roomName);
  } else {
    socket.emit("kit-used", roomName);
    console.log("KIT is being used: ", roomName);
  }
  console.log("User Rooms:");
  console.log(rooms);
}

function socketMessage(socket, payload, roomName) {
  console.log("Message: ");
  console.log(`Payload from ${socket.id} to ${roomName}`);
  socket.broadcast.to(roomName).emit("message", payload);
}

function socketUserOffline(io, socket, roomName) {
  var room = io.sockets.adapter.rooms.get(roomName);
  if (room === undefined) {
    console.log("KIT not available: ", roomName);
    socket.emit("kit-not-available", roomName);
  } else if (room.size === 2) {
    socket.broadcast.to(roomName).emit("user-offline");
    console.log("User left KIT: ", socket.id);
  }
  socket.leave(roomName);
  console.log("User left: ", socket.id);
  console.log(room);
}

function socketIO(io) {
  io.on("connection", (socket) => {
    console.log("User connected: ", socket.id);

    socket.on("UTK-online", (roomName) => {
      socketUTKOnline(io, socket, roomName);
    });

    socket.on("user-online", (roomName) => {
      socketUSEROnline(io, socket, roomName);
    });

    socket.on("message", (payload, roomName) => {
      socketMessage(socket, payload, roomName);
    });

    socket.on("user-offline", (roomName) => {
      socketUserOffline(io, socket, roomName);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected: ", socket.id);
    });
  });
}

module.exports = { socketIO };
