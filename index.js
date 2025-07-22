require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
const connectDB = require('./db');
const socketHandlerChat = require('./socketHandlerChat');
const socketHandlerAudio = require('./socketHandlerAudio');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*',
method : ['GET', 'POST'],
credentials: true } });

app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.get('/api/protected', require('./middleware/auth'), (req, res) => {
  res.json({ message: 'Protected data', user: req.user });
});

connectDB();
socketHandlerChat(io);
socketHandlerAudio(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

///////////////////////////////////////////////////////////////////////////////////////////////
// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const cors = require('cors');

// const app = express();
// app.use(cors());
// const server = http.createServer(app);
// const io = socketIo(server, { cors: { origin: '*' } });

// const users = {};  

// io.on('connection', (socket) => {
//   console.log('User connected:', socket.id);

//   socket.on('register', (username) => {
//     for (const [existingUsername, id] of Object.entries(users)) {
//       if (id === socket.id) {
//         delete users[existingUsername];
//         break;
//       }
//     }
    
//     users[username] = socket.id;
//     console.log('Users registered:', users);
//     socket.emit('registered', { username });
//   });

//   socket.on('call-user', ({ to, offer, from }) => {
//     console.log(`Call from ${from} to ${to}`);
//     if (users[to]) {
//       io.to(users[to]).emit('incoming-call', { from, offer });
//     } else {
//       console.log(`User ${to} not found`);
//       socket.emit('user-not-found', { username: to });
//     }
//   });

//   socket.on('answer-call', ({ to, answer }) => {
//     console.log(`Call answered by ${to}`);
//     if (users[to]) {
//       io.to(users[to]).emit('call-answered', { answer });
//     }
//   });

//   socket.on('ice-candidate', ({ to, candidate }) => {
//     if (users[to]) {
//       io.to(users[to]).emit('ice-candidate', { candidate });
//     }
//   });

//   socket.on('reject-call', ({ to }) => {
//     if (users[to]) {
//       io.to(users[to]).emit('call-rejected');
//     }
//   });

//   socket.on('end-call', ({ to }) => {
//     if (users[to]) {
//       io.to(users[to]).emit('call-ended');
//     }
//   });

//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);
//     // Remove user from registered users
//     for (const [username, id] of Object.entries(users)) {
//       if (id === socket.id) {
//         delete users[username];
//         console.log(`Removed user ${username}`);
//         break;
//       }
//     }
//     console.log('Remaining users:', users);
//   });
// });

// server.listen(5000, () => console.log('Signaling server running on port 5000'));







//////////////////////////////////////////////////////////////////////////////////////////////////
// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const cors = require('cors');

// const app = express();
// app.use(cors());

// const server = http.createServer(app);
// const io = socketIo(server, { cors: { origin: '*' } });

// const users = {};  // { username: socket.id }

// io.on('connection', (socket) => {
//   console.log('User connected:', socket.id);

//   socket.on('register', (username) => {
//     users[username] = socket.id;
//     console.log(users);
//   });

//   socket.on('call-user', ({ to, offer, from }) => {
//     if (users[to]) {
//       io.to(users[to]).emit('incoming-call', { from, offer });
//     }
//   });

//   socket.on('answer-call', ({ to, answer }) => {
//     if (users[to]) {
//       io.to(users[to]).emit('call-answered', { answer });
//     }
//   });

//   socket.on('ice-candidate', ({ to, candidate }) => {
//     if (users[to]) {
//       io.to(users[to]).emit('ice-candidate', { candidate });
//     }
//   });

//   socket.on('disconnect', () => {
//     for (const [username, id] of Object.entries(users)) {
//       if (id === socket.id) {
//         delete users[username];
//         break;
//       }
//     }
//   });
// });

// server.listen(5000, () => console.log('Signaling server running on port 5000'));
