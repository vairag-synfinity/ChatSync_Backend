const users = {};
const rooms = {}; // roomId -> { participants: [], creator: '' }
const userRooms = {}; // username -> roomId

const socketHandlerMultiUserGroupVoiceCall = (io) => {
  io.on('connection', socket => {
    
    socket.on('register', username => {
      users[username] = socket.id;
      socket.username = username;
      console.log(`${username} connected [${socket.id}]`);
    });

    // Create room for group call
    socket.on('create-room', ({ participants, creator }) => {
      const roomId = generateRoomId();
      
      rooms[roomId] = {
        participants: [creator], // Start with just creator
        creator: creator
      };
      
      userRooms[creator] = roomId;
      socket.join(roomId);

      console.log(`Room ${roomId} created by ${creator}`);
      
      // Invite other participants
      participants.forEach(participant => {
        if (participant !== creator) {
          const participantSocketId = users[participant];
          if (participantSocketId) {
            io.to(participantSocketId).emit('incoming-call', {
              from: creator,
              offer: null, // Will be sent in separate call-user event
              roomId: roomId
            });
          }
        }
      });

      // Notify creator that room is created
      socket.emit('room-created', {
        roomId: roomId,
        participants: [creator]
      });

      // Start establishing connections between creator and each participant
      setTimeout(() => {
        participants.forEach(participant => {
          if (participant !== creator) {
            socket.emit('request-connection', {
              from: participant,
              roomId: roomId
            });
          }
        });
      }, 1000);
    });

    // Join existing room
    socket.on('join-room', ({ roomId, username }) => {
      const room = rooms[roomId];
      if (room && !room.participants.includes(username)) {
        room.participants.push(username);
        userRooms[username] = roomId;
        socket.join(roomId);

        console.log(`${username} joined room ${roomId}`);

        // Notify all participants in the room
        socket.to(roomId).emit('user-joined-room', {
          roomId: roomId,
          participant: username,
          participants: room.participants
        });

        // Notify the user who just joined
        socket.emit('user-joined-room', {
          roomId: roomId,
          participant: username,
          participants: room.participants
        });

        // Establish connections with existing participants
        room.participants.forEach(participant => {
          if (participant !== username) {
            const participantSocketId = users[participant];
            if (participantSocketId) {
              // Tell existing participant to connect to new user
              io.to(participantSocketId).emit('request-connection', {
                from: username,
                roomId: roomId
              });
            }
          }
        });
      }
    });

    // Leave room
    socket.on('leave-room', ({ roomId, username }) => {
      const room = rooms[roomId];
      if (room) {
        room.participants = room.participants.filter(p => p !== username);
        delete userRooms[username];
        socket.leave(roomId);

        console.log(`${username} left room ${roomId}`);

        // Notify remaining participants
        socket.to(roomId).emit('user-left-room', {
          participant: username,
          participants: room.participants
        });

        // If room is empty, delete it
        if (room.participants.length === 0) {
          delete rooms[roomId];
          console.log(`Room ${roomId} deleted (empty)`);
        }
      }
    });

    // Handle WebRTC signaling
    socket.on('call-user', ({ to, from, offer, roomId }) => {
      const targetSocketId = users[to];
      console.log(`Sending call from ${from} to ${to} - ${targetSocketId}`);
      if (targetSocketId) {
        io.to(targetSocketId).emit('incoming-call', { 
          from, 
          offer,
          roomId: roomId 
        });
      }
    });

    socket.on('answer-call', ({ to, from, answer, roomId }) => {
      const targetSocketId = users[to];
      if (targetSocketId) {
        io.to(targetSocketId).emit('call-answered', { 
          from, 
          answer 
        });
        console.log(`Call answered by ${from} to ${to} in room ${roomId}`);
      }
    });

    socket.on('ice-candidate', ({ to, from, candidate }) => {
      const targetSocketId = users[to];
      if (targetSocketId) {
        io.to(targetSocketId).emit('ice-candidate', { 
          from, 
          candidate 
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      if (socket.username) {
        const username = socket.username;
        const roomId = userRooms[username];
        
        // Remove from users
        delete users[username];
        
        // Remove from room if in one
        if (roomId) {
          const room = rooms[roomId];
          if (room) {
            room.participants = room.participants.filter(p => p !== username);
            delete userRooms[username];
            
            // Notify remaining participants
            socket.to(roomId).emit('user-left-room', {
              participant: username,
              participants: room.participants
            });

            // If room is empty, delete it
            if (room.participants.length === 0) {
              delete rooms[roomId];
              console.log(`Room ${roomId} deleted (empty after disconnect)`);
            }
          }
        }
        
        console.log(`${username} disconnected`);
      }
    });
  });
};

// Utility function to generate room IDs
function generateRoomId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

module.exports = { socketHandlerMultiUserGroupVoiceCall };
