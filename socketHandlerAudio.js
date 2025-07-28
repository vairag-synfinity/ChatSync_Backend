const users = {};

const socketHandlerAudio = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('register', (username) => {
      // Prevent same socket from re-registering
      for (const [existingUsername, id] of Object.entries(users)) {
        if (id === socket.id) {
          delete users[existingUsername];
          break;
        }
      }

      socket.username = username;
      users[username] = socket.id;

      console.log(`[REGISTERED] ${username} with socket ${socket.id}`);
      console.log('Users map:', users);

      socket.emit('registered', { username });
    });

    socket.on('call-user', ({ to, offer, from }) => {
      console.log(`[CALL-USER] ${from} is calling ${to}`);
      if (users[to]) {
        io.to(users[to]).emit('incoming-call', { from, offer });
        console.log(`[INCOMING-CALL] Sent to ${to}`);
      } else {
        console.log(`[CALL-USER] User ${to} not found`);
        socket.emit('user-not-found', { username: to });
      }
    });

    socket.on('answer-call', ({ to, answer }) => {
      console.log(`[ANSWER-CALL] to: ${to}`);
      if (users[to]) {
        io.to(users[to]).emit('call-answered', { answer, from: socket.username });
        console.log(`[ANSWER-CALL] Sent to ${to}`);
      } else {
        console.log(`[ANSWER-CALL] User ${to} not found`);
      }
    });

    socket.on('ice-candidate', ({ to, candidate }) => {
      console.log(`[ICE-CANDIDATE] from ${socket.username} to ${to}`);
      if (users[to]) {
        io.to(users[to]).emit('ice-candidate', { candidate, from: socket.username });
      } else {
        console.log(`[ICE-CANDIDATE] User ${to} not found`);
      }
    });

    socket.on('reject-call', ({ to }) => {
      console.log(`[REJECT-CALL] ${socket.username} rejected call from ${to}`);
      if (users[to]) {
        io.to(users[to]).emit('call-rejected', { from: socket.username });
      }
    });

    socket.on('end-call', ({ to }) => {
      console.log(`[END-CALL] ${socket.username} ended call with ${to}`);
      if (users[to]) {
        io.to(users[to]).emit('call-ended', { from: socket.username });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      for (const [username, id] of Object.entries(users)) {
        if (id === socket.id) {
          delete users[username];
          console.log(`[DISCONNECT] Removed user ${username}`);
          break;
        }
      }
      console.log('Remaining users:', users);
    });
  });
};

module.exports = socketHandlerAudio;
