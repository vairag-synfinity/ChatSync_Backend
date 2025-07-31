
const users = {}; 

const socketHandlerMultiUserGroupVoiceCall = (io) => {


io.on('connection', socket => {
  socket.on('register', username => {
    users[username] = socket.id;
    socket.username = username;
    console.log(`${username} connected [${socket.id}]`);
  });

  socket.on('call-user', ({ to, from, offer }) => {
    const targetSocketId = users[to];
    console.log(`Sending call from ${from} to ${to} - ${targetSocketId}`);
    if (targetSocketId) {
      io.to(targetSocketId).emit('incoming-call', { from, offer });
    }
  });

  socket.on('answer-call', ({ to, from, answer }) => {
    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('call-answered', { from, answer });
    }
  });

  socket.on('ice-candidate', ({ to, from, candidate }) => {
    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit('ice-candidate', { from, candidate });
    }
  });

  socket.on('disconnect', () => {
    if (socket.username) delete users[socket.username];
  });
});
}

module.exports = {socketHandlerMultiUserGroupVoiceCall};
