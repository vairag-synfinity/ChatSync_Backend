const users = {};  
const socketHandlerAudio = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('register', (username) => {
      // Remove any existing registration for this socket
      for (const [existingUsername, id] of Object.entries(users)) {
        if (id === socket.id) {
          delete users[existingUsername];
          break;
        }
      }
      
      users[username] = socket.id;
      console.log('Users registered:', users);
      socket.emit('registered', { username });
    });

    socket.on('call-user', ({ to, offer, from }) => {
      console.log(`Call from ${from} to ${to}`);
      if (users[to]) {
        io.to(users[to]).emit('incoming-call', { from, offer });
      } else {
        console.log(`User ${to} not found`);
        socket.emit('user-not-found', { username: to });
      }
    });

    socket.on('answer-call', ({ to, answer, from }) => {
      console.log(`Call answered by ${from}, sending answer to ${to}`);
      if (users[to]) {
        // Send the answer back to the original caller
        io.to(users[to]).emit('call-answered', { answer, from });
      } else {
        console.log(`Caller ${to} not found when sending answer`);
      }
    });

    socket.on('ice-candidate', ({ to, candidate, from }) => {
      console.log(`ICE candidate from ${from} to ${to}`);
      if (users[to]) {
        io.to(users[to]).emit('ice-candidate', { candidate, from });
      }
    });

    socket.on('reject-call', ({ to, from }) => {
      console.log(`Call rejected by ${from}, notifying ${to}`);
      if (users[to]) {
        io.to(users[to]).emit('call-rejected', { from });
      }
    });

    socket.on('end-call', ({ to, from }) => {
      console.log(`Call ended by ${from}, notifying ${to}`);
      if (users[to]) {
        io.to(users[to]).emit('call-ended', { from });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Remove user from registered users
      for (const [username, id] of Object.entries(users)) {
        if (id === socket.id) {
          delete users[username];
          console.log(`Removed user ${username}`);
          break;
        }
      }
      console.log('Remaining users:', users);
    });
  });
}

module.exports = socketHandlerAudio;
