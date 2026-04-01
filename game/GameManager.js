class GameManager {
  constructor() {
    this.rooms = new Map();
  }

  generateRoomCode() {
    let code;
    do {
      code = Math.random().toString(36).substring(2, 6).toUpperCase();
    } while (this.rooms.has(code));
    return code;
  }

  createRoom() {
    const { Room } = require('./Room');
    const code = this.generateRoomCode();
    const room = new Room(code);
    this.rooms.set(code, room);
    return room;
  }

  getRoom(code) {
    return this.rooms.get(code.toUpperCase()) || null;
  }

  deleteRoom(code) {
    this.rooms.delete(code.toUpperCase());
  }

  getRoomBySocketId(socketId) {
    for (const room of this.rooms.values()) {
      if (room.players.some(p => p.socketId === socketId)) {
        return room;
      }
    }
    return null;
  }

  getPlayerBySocketId(socketId, room) {
    return room.players.find(p => p.socketId === socketId) || null;
  }
}

module.exports = GameManager;
