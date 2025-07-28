require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
const connectDB = require('./db');
const socketHandlerChat = require('./socketHandlerChat');
const socketHandlerAudio = require('./socketHandlerAudio');
const {handleGroupChat} = require('./socketHandlerGroupChat');
const userRoutes = require("./routes/groupChat");
const {socketHandlerMultiUserGroupVoiceCall} = require('./socketHandlerMultiUserGroupVoiceCall');

const app = express();
const server = http.createServer(app);
const io = new socketIo.Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.get('/api/protected', require('./middleware/auth'), (req, res) => {
  res.json({ message: 'Protected data', user: req.user });
});



// Group chat routes
app.get("/users/search", userRoutes);
app.post("/groups/create", userRoutes);
app.get("/groups/user/:username", userRoutes);
app.get("/groups/:groupId/messages", userRoutes);
app.post("/groups/:groupId/messages", userRoutes);
app.post("/groups/:groupId/add-member", userRoutes);
app.post("/groups/:groupId/remove-member", userRoutes);


app.get('/', (req, res) => {
  res.send('Welcome to the ChatSync Backend');
});

connectDB();
// socketHandlerChat(io);
// socketHandlerAudio(io);
// handleGroupChat(io)
socketHandlerMultiUserGroupVoiceCall(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

