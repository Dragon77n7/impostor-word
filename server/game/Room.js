const Player = require('./Player');
const QuestionManager = require('./QuestionManager');

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

var PHASES = {
  LOBBY: 'lobby',
  ANSWERING: 'answering',
  REVEAL: 'reveal',
  VOTING: 'voting',
  RESULT: 'result',
  FINISHED: 'finished'
};

class Room {
  constructor(roomCode) {
    this.roomCode = roomCode;
    this.players = [];
    this.phase = PHASES.LOBBY;
    this.currentRound = 0;
    this.totalRounds = 0;
    this.impostorId = null;
    this.currentQuestionPair = null;
    this.answers = {};
    this.votes = {};
    this.scores = {};
    this.questionManager = new QuestionManager();
    this.roundResult = null;
  }

  addPlayer(name, socketId) {
    if (this.phase !== PHASES.LOBBY) {
      return { error: 'Gra juz trwa, nie mozna dolaczyc.' };
    }
    if (this.players.length >= 10) {
      return { error: 'Pokoj jest pelny (max 10 graczy).' };
    }
    var existing = this.players.find(function(p) {
      return p.name.toLowerCase() === name.toLowerCase();
    });
    if (existing) {
      return { error: 'Ta nazwa jest juz zajeta.' };
    }
    var id = generateId();
    var player = new Player(id, name, socketId);
    this.players.push(player);
    this.scores[id] = 0;
    return { player: player };
  }

  removePlayer(socketId) {
    var idx = this.players.findIndex(function(p) { return p.socketId === socketId; });
    if (idx === -1) return null;
    var player = this.players[idx];
    player.disconnect();
    if (this.phase === PHASES.LOBBY) {
      this.players.splice(idx, 1);
      delete this.scores[player.id];
    }
    return player;
  }

  getConnectedPlayers() {
    return this.players.filter(function(p) { return p.connected; });
  }

  startGame(totalRounds) {
    if (this.players.length < 2) {
      return { error: 'Potrzeba co najmniej 2 graczy.' };
    }
    var r = parseInt(totalRounds);
    this.totalRounds = (r && r >= 1 && r <= 20) ? r : this.players.length;
    this.currentRound = 0;
    this.questionManager.reset();
    return this.startNextRound();
  }

  startNextRound() {
    this.currentRound++;
    this.answers = {};
    this.votes = {};
    this.roundResult = null;

    var connected = this.getConnectedPlayers();
    var impostorIdx = Math.floor(Math.random() * connected.length);
    this.impostorId = connected[impostorIdx].id;
    this.currentQuestionPair = this.questionManager.getRandomPair();
    this.phase = PHASES.ANSWERING;

    return {
      round: this.currentRound,
      total: this.totalRounds,
      impostorId: this.impostorId,
      questionPair: this.currentQuestionPair
    };
  }

  submitAnswer(playerId, answer) {
    if (this.phase !== PHASES.ANSWERING) {
      return { error: 'Nie jestes w fazie odpowiedzi.' };
    }
    if (this.answers[playerId] !== undefined) {
      return { error: 'Juz wyslales odpowiedz.' };
    }
    if (!answer || answer.trim() === '') {
      return { error: 'Odpowiedz nie moze byc pusta.' };
    }
    this.answers[playerId] = answer.trim();

    var connected = this.getConnectedPlayers();
    var self = this;
    var allAnswered = connected.every(function(p) { return self.answers[p.id] !== undefined; });

    if (allAnswered) {
      this.phase = PHASES.REVEAL;
      return { allAnswered: true };
    }
    return { allAnswered: false, count: Object.keys(this.answers).length, total: connected.length };
  }

  moveToVoting() {
    this.phase = PHASES.VOTING;
  }

  submitVote(voterId, targetId) {
    if (this.phase !== PHASES.VOTING) {
      return { error: 'Nie jestes w fazie glosowania.' };
    }
    if (this.votes[voterId] !== undefined) {
      return { error: 'Juz zaglosowalas.' };
    }
    var target = this.players.find(function(p) { return p.id === targetId; });
    if (!target) {
      return { error: 'Nieznany gracz.' };
    }
    if (voterId === targetId) {
      return { error: 'Nie mozesz glosowac na siebie.' };
    }
    this.votes[voterId] = targetId;

    var connected = this.getConnectedPlayers();
    var self = this;
    var allVoted = connected.every(function(p) { return self.votes[p.id] !== undefined; });

    if (allVoted) {
      this.phase = PHASES.RESULT;
      this.roundResult = this.calculateResult();
      return { allVoted: true, result: this.roundResult };
    }
    return { allVoted: false, count: Object.keys(this.votes).length, total: connected.length };
  }

  calculateResult() {
    var voteCounts = {};
    this.players.forEach(function(p) { voteCounts[p.id] = 0; });
    Object.values(this.votes).forEach(function(targetId) {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });

    // Znajdz maksymalna liczbe glosow
    var maxVotes = 0;
    Object.keys(voteCounts).forEach(function(pid) {
      if (voteCounts[pid] > maxVotes) {
        maxVotes = voteCounts[pid];
      }
    });

    // Sprawdz ilu graczy ma tyle samo maksymalnych glosow (remis)
    var playersWithMaxVotes = Object.keys(voteCounts).filter(function(pid) {
      return voteCounts[pid] === maxVotes;
    });

    // Impostor zlapany TYLKO jesli on jeden ma najwiecej glosow (brak remisu)
    var impostorCaught = false;
    var mostVotedId = null;

    if (playersWithMaxVotes.length === 1) {
      mostVotedId = playersWithMaxVotes[0];
      impostorCaught = (mostVotedId === this.impostorId);
    } else {
      // Remis - nikt nie zostaje wskazany jednoznacznie
      mostVotedId = null;
      impostorCaught = false;
    }

    var self = this;

    if (impostorCaught) {
      // Wszyscy oprocz impostora dostaja +1
      this.getConnectedPlayers().forEach(function(p) {
        if (p.id !== self.impostorId) {
          self.scores[p.id] = (self.scores[p.id] || 0) + 1;
        }
      });
    } else {
      // Impostor ucieka (remis lub zly wybor) -> impostor +2
      this.scores[this.impostorId] = (this.scores[this.impostorId] || 0) + 2;
    }

    return {
      impostorId: this.impostorId,
      mostVotedId: mostVotedId,
      impostorCaught: impostorCaught,
      isDraw: playersWithMaxVotes.length > 1,
      drawPlayerIds: playersWithMaxVotes.length > 1 ? playersWithMaxVotes : [],
      voteCounts: voteCounts,
      normalQuestion: this.currentQuestionPair.normal,
      impostorQuestion: this.currentQuestionPair.impostor,
      scores: Object.assign({}, this.scores)
    };
  }

  isGameOver() {
    return this.currentRound >= this.totalRounds;
  }

  getFinalScores() {
    var self = this;
    return this.players
      .map(function(p) { return { id: p.id, name: p.name, score: self.scores[p.id] || 0 }; })
      .sort(function(a, b) { return b.score - a.score; });
  }

  getPublicState() {
    var self = this;
    var showAnswers = (this.phase === 'reveal' || this.phase === 'voting' || this.phase === 'result');
    return {
      roomCode: this.roomCode,
      phase: this.phase,
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      players: this.players.map(function(p) {
        return {
          id: p.id,
          name: p.name,
          score: self.scores[p.id] || 0,
          connected: p.connected
        };
      }),
      answers: showAnswers ? this.answers : {},
      votes: this.phase === 'result' ? this.votes : {},
      roundResult: this.roundResult,
      normalQuestion: this.currentQuestionPair ? this.currentQuestionPair.normal : null,
      answersCount: Object.keys(this.answers).length,
      votesCount: Object.keys(this.votes).length
    };
  }
}

module.exports.Room = Room;
module.exports.PHASES = PHASES;
