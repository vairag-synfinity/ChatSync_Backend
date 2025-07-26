
 const users = {};  
const socketHandlerAudio = (io) => {
 io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register', (username) => {
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

  socket.on('answer-call', ({ to, answer }) => {
    console.log(`Call answered by ${to}`);
    if (users[to]) {
      io.to(users[to]).emit('call-answered', { answer });
    }
  });

  socket.on('ice-candidate', ({ to, candidate }) => {
    if (users[to]) {
      io.to(users[to]).emit('ice-candidate', { candidate });
    }
  });

  socket.on('reject-call', ({ to }) => {
    if (users[to]) {
      io.to(users[to]).emit('call-rejected');
    }
  });

  socket.on('end-call', ({ to }) => {
    if (users[to]) {
      io.to(users[to]).emit('call-ended');
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
