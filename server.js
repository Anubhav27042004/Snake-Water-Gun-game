const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let players = {}; // Store players' choices

// Serve static files from the "public" folder
app.use(express.static('public'));

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('choice', (data) => {
    // Store player's choice
    players[socket.id] = data.choice;

    if (Object.keys(players).length === 2) {
      // If two players have submitted their choices
      const playerIds = Object.keys(players);
      const player1 = players[playerIds[0]];
      const player2 = players[playerIds[1]];

      // Determine the winner for both players
      const resultForPlayer1 = determineWinner(player1, player2); // Player 1's perspective
      const resultForPlayer2 = determineWinner(player2, player1); // Player 2's perspective

      // Send result to both players
      io.to(playerIds[0]).emit('result', `You chose ${player1}, Opponent chose ${player2}. ${resultForPlayer1}`);
      io.to(playerIds[1]).emit('result', `You chose ${player2}, Opponent chose ${player1}. ${resultForPlayer2}`);

      // Reset players for the next round
      players = {};
    }
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    delete players[socket.id]; // Remove player from the game
  });
});

// Function to determine the winner
function determineWinner(player, opponent) {
  if (player === opponent) return "It's a Draw!";
  if (
    (player === 'S' && opponent === 'W') || // Snake beats Water
    (player === 'W' && opponent === 'G') || // Water beats Gun
    (player === 'G' && opponent === 'S')    // Gun beats Snake
  ) {
    return "You Win!";
  }
  return "Opponent Wins!";
}

// Start the server
server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
