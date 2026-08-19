const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const WORDS = ['apple', 'car', 'tree', 'sun', 'house', 'pizza', 'cat', 'guitar', 'boat', 'star'];
let currentWord = WORDS[Math.floor(Math.random() * WORDS.length)];

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Send the current word state
  socket.emit('system-message', 'Welcome to Draw & Guess! Start drawing or guessing in the chat.');

  // Handle drawing coordinates
  socket.on('draw', (data) => {
    socket.broadcast.emit('draw', data);
  });

  // Handle canvas clearing
  socket.on('clear-canvas', () => {
    io.emit('clear-canvas');
  });

  // Handle chat messages and guess validation
  socket.on('chat-message', (data) => {
    const isCorrect = data.message.trim().toLowerCase() === currentWord.toLowerCase();

    if (isCorrect) {
      io.emit('chat-message', {
        user: 'System',
        message: `🎉 ${data.user} guessed the word correctly! The word was "${currentWord}".`,
        isSystem: true
      });
      // Pick a new word
      currentWord = WORDS[Math.floor(Math.random() * WORDS.length)];
      io.emit('system-message', `New round started! Guess the new drawing.`);
    } else {
      io.emit('chat-message', { user: data.user, message: data.message });
    }
  });

  socket.on('get-new-word', () => {
    currentWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    socket.emit('secret-word', currentWord);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));