class Player {
  constructor(id, name, socketId) {
    this.id = id;
    this.name = name;
    this.socketId = socketId;
    this.score = 0;
    this.connected = true;
  }

  disconnect() {
    this.connected = false;
  }

  reconnect(socketId) {
    this.socketId = socketId;
    this.connected = true;
  }
}

module.exports = Player;
