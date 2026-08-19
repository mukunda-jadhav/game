const socket = io();
const canvas = document.getElementById('paint-canvas');
const ctx = canvas.getContext('2d');

let isDrawing = false;
let lastX = 0;
let lastY = 0;
const username = prompt("Enter your username:") || `Player_${Math.floor(Math.random()*1000)}`;

// Drawing logic
function drawLine(x1, y1, x2, y2, emit = false) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.closePath();

  if (emit) {
    socket.emit('draw', { x1, y1, x2, y2 });
  }
}

canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  drawLine(lastX, lastY, e.offsetX, e.offsetY, true);
  lastX = e.offsetX;
  lastY = e.offsetY;
});

canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseout', () => isDrawing = false);

// Receive drawings from other players
socket.on('draw', (data) => drawLine(data.x1, data.y1, data.x2, data.y2, false));

// Clear Canvas
document.getElementById('clear-btn').addEventListener('click', () => {
  socket.emit('clear-canvas');
});

socket.on('clear-canvas', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Secret word generation
const newWordBtn = document.getElementById('new-word-btn');
const wordDisplay = document.getElementById('word-display');

newWordBtn.addEventListener('click', () => {
  socket.emit('get-new-word');
});

socket.on('secret-word', (word) => {
  wordDisplay.innerText = `Your Word: ${word.toUpperCase()}`;
});

// Chat & Guessing
const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = chatInput.value;
  if (!message) return;
  socket.emit('chat-message', { user: username, message });
  chatInput.value = '';
});

function appendMessage(text, isSystem = false) {
  const div = document.createElement('div');
  div.className = `message ${isSystem ? 'system' : ''}`;
  div.innerText = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

socket.on('chat-message', (data) => {
  appendMessage(`${data.user}: ${data.message}`, data.isSystem);
});

socket.on('system-message', (msg) => {
  appendMessage(`[System]: ${msg}`, true);
});