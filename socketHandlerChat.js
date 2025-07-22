const Message = require('./models/Message');

const activeUsers = new Map(); // username ➔ Set of socketIds

const socketHandlerChat = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('register_user', async (username) => {
      if (!activeUsers.has(username)) {
        activeUsers.set(username, new Set());
      }
      activeUsers.get(username).add(socket.id);
      socket.username = username;

      io.emit('users_updated', Array.from(activeUsers.keys()));

      const messages = await Message.find({ type: { $ne: 'private' } }).sort({ createdAt: 1 });
      messages.forEach(msg => socket.emit('receive_message', { ...msg._doc, type: msg.type || 'public' }));
    });

    socket.on('send_message', async (data) => {
      const message = await new Message({
        text: data.text,
        username: data.username,
        senderId: socket.id,
        createdAtDate: new Date(),
        type: 'public'
      }).save();

      io.emit('receive_message', { ...message._doc });
    });

    socket.on('send_private_message', async ({ to, from, text }) => {
      const receiverSockets = activeUsers.get(to);
      if (receiverSockets && receiverSockets.size > 0) {
        const message = await new Message({
          text,
          username: from,
          senderId: socket.id,
          receiver: to,
          createdAtDate: new Date(),
          type: 'private'
        }).save();

        receiverSockets.forEach(socketId => {
          io.to(socketId).emit('receive_private_message', { ...message._doc });
        });

        socket.emit('private_message_sent', { ...message._doc });
      } else {
        socket.emit('user_not_found', { username: to });
      }
    });

    socket.on('get_private_chat_history', async ({ user1, user2 }) => {
      const messages = await Message.find({
        type: 'private',
        $or: [
          { username: user1, receiver: user2 },
          { username: user2, receiver: user1 }
        ]
      }).sort({ createdAt: 1 });

      socket.emit('private_chat_history', { user1, user2, messages });
    });

    socket.on('delete_message', async ({ messageId }) => {
      await Message.findByIdAndDelete(messageId);
      io.emit('message_deleted', { messageId });
    });

    socket.on('disconnect', () => {
      if (socket.username) {
        const userSockets = activeUsers.get(socket.username);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            activeUsers.delete(socket.username);
          }
        }
      }
      io.emit('users_updated', Array.from(activeUsers.keys()));
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = socketHandlerChat;
