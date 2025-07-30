const Group = require('./models/Group');


// const socketAuth = (socket, next) => {
//   next();
// };

const handleGroupChat = (io) => {
  // io.use(socketAuth);
  
  io.on('connection', (socket) => {
    // console.log('User connected:', socket.id);
    
    socket.on('join_group_room', async ({ name, room }) => {
      try {
        const group = await Group.findById(room);
        if (group && group.members.some(member => member.username === name)) {
          socket.join(room);
          console.log(`${name} joined room ${room}`);
          
          socket.to(room).emit('user_joined', {
            user: name,
            message: `${name} joined the chat`
          });
        }
      } catch (error) {
        console.error('Error joining room:', error);
      }
    });
    
    socket.on('leave_group_room', ({ name, room }) => {
      socket.leave(room);
      console.log(`${name} left room ${room}`);
    });
    
    socket.on('send_group_message', async (data) => {
      try {
        const { room, user, message } = data;

        
        
        const group = await Group.findById(room);
        if (group && group.members.some(member => member.username === user)) {
          io.to(room).emit('receive_group_message', {
            user,
            message,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });
    
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = { handleGroupChat };
