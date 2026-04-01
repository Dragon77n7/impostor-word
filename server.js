const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const GameManager = require('./game/GameManager');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const gameManager = new GameManager();

function broadcastRoomState(room) {
  io.to(room.roomCode).emit('room_state', room.getPublicState());
}

function sendPrivateQuestions(room) {
  var connected = room.getConnectedPlayers();
  connected.forEach(function(player) {
    var question = player.id === room.impostorId
      ? room.currentQuestionPair.impostor
      : room.currentQuestionPair.normal;
    console.log('[QUESTION] Wysylam do ' + player.name + ': ' + question);
    io.to(player.socketId).emit('your_question', {
      question: question,
      roundNumber: room.currentRound,
      totalRounds: room.totalRounds
    });
  });
}

io.on('connection', function(socket) {
  console.log('[CONNECT] ' + socket.id);

  socket.on('create_room', function(data, callback) {
    console.log('[CREATE_ROOM] ' + data.name);
    var room = gameManager.createRoom();
    var result = room.addPlayer(data.name, socket.id);
    if (result.error) return callback({ error: result.error });
    socket.join(room.roomCode);
    broadcastRoomState(room);
    callback({ roomCode: room.roomCode, playerId: result.player.id });
  });

  socket.on('join_room', function(data, callback) {
    console.log('[JOIN_ROOM] ' + data.name + ' -> ' + data.roomCode);
    var room = gameManager.getRoom(data.roomCode);
    if (!room) return callback({ error: 'Pokoj nie istnieje.' });
    var result = room.addPlayer(data.name, socket.id);
    if (result.error) return callback({ error: result.error });
    socket.join(room.roomCode);
    broadcastRoomState(room);
    callback({ roomCode: room.roomCode, playerId: result.player.id });
  });

  socket.on('start_game', function(data, callback) {
    console.log('[START_GAME] pokoj: ' + data.roomCode + ', rund: ' + data.rounds);
    var room = gameManager.getRoom(data.roomCode);
    if (!room) return callback({ error: 'Pokoj nie istnieje.' });
    var result = room.startGame(data.rounds);
    if (result.error) return callback({ error: result.error });
    console.log('[START_GAME] Runda ' + room.currentRound + ', impostor: ' + room.impostorId);
    broadcastRoomState(room);
    sendPrivateQuestions(room);
    callback({ ok: true });
  });

  socket.on('submit_answer', function(data, callback) {
    console.log('[ANSWER] gracz ' + data.playerId + ': ' + data.answer);
    var room = gameManager.getRoom(data.roomCode);
    if (!room) return callback({ error: 'Pokoj nie istnieje.' });
    var result = room.submitAnswer(data.playerId, data.answer);
    if (result.error) return callback({ error: result.error });
    broadcastRoomState(room);
    callback({ ok: true });
  });

  socket.on('move_to_voting', function(data, callback) {
    console.log('[MOVE_TO_VOTING] pokoj: ' + data.roomCode);
    var room = gameManager.getRoom(data.roomCode);
    if (!room) {
      if (callback) callback({ error: 'Pokoj nie istnieje.' });
      return;
    }
    if (room.phase !== 'reveal') {
      if (callback) callback({ error: 'Zla faza: ' + room.phase });
      return;
    }
    room.moveToVoting();
    broadcastRoomState(room);
    if (callback) callback({ ok: true });
  });

  socket.on('submit_vote', function(data, callback) {
    console.log('[VOTE] ' + data.voterId + ' -> ' + data.targetId);
    var room = gameManager.getRoom(data.roomCode);
    if (!room) return callback({ error: 'Pokoj nie istnieje.' });
    var result = room.submitVote(data.voterId, data.targetId);
    if (result.error) return callback({ error: result.error });
    broadcastRoomState(room);
    callback({ ok: true });
  });

  socket.on('next_round', function(data, callback) {
    console.log('[NEXT_ROUND] pokoj: ' + data.roomCode);
    var room = gameManager.getRoom(data.roomCode);
    if (!room) {
      if (callback) callback({ error: 'Pokoj nie istnieje.' });
      return;
    }
    if (room.isGameOver()) {
      room.phase = 'finished';
      broadcastRoomState(room);
      if (callback) callback({ finished: true });
      return;
    }
    room.startNextRound();
    broadcastRoomState(room);
    sendPrivateQuestions(room);
    if (callback) callback({ ok: true });
  });

  socket.on('restart_game', function(data, callback) {
    console.log('[RESTART] pokoj: ' + data.roomCode);
    var room = gameManager.getRoom(data.roomCode);
    if (!room) {
      if (callback) callback({ error: 'Pokoj nie istnieje.' });
      return;
    }
    room.phase = 'lobby';
    room.currentRound = 0;
    room.totalRounds = 0;
    room.answers = {};
    room.votes = {};
    room.roundResult = null;
    room.impostorId = null;
    room.players.forEach(function(p) { room.scores[p.id] = 0; });
    room.questionManager.reset();
    broadcastRoomState(room);
    if (callback) callback({ ok: true });
  });

  socket.on('disconnect', function() {
    console.log('[DISCONNECT] ' + socket.id);
    var room = gameManager.getRoomBySocketId(socket.id);
    if (!room) return;
    var player = room.removePlayer(socket.id);
    if (!player) return;
    console.log('[LEAVE] ' + player.name + ' opuscil pokoj ' + room.roomCode);
    if (room.getConnectedPlayers().length === 0) {
      gameManager.deleteRoom(room.roomCode);
      console.log('[DELETE] Pokoj ' + room.roomCode + ' usuniety');
    } else {
      broadcastRoomState(room);
    }
  });
});

const PORT = 3001;
server.listen(PORT, function() {
  console.log('Serwer dziala na porcie ' + PORT);
});
