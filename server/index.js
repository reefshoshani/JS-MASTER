require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/code-blocks')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
const codeBlocksRouter = require('./routes/codeBlocks');
app.use('/api/code-blocks', codeBlocksRouter);

// Initialize database with code blocks
const { initializeDatabase } = require('./init/initialData');
initializeDatabase();

// Socket.io connection handling
const connectedUsers = new Map();
const mentors = new Map();

io.on('connection', (socket) => {
    // Join room
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        const roomUsers = connectedUsers.get(roomId) || new Set();
        roomUsers.add(socket.id);
        connectedUsers.set(roomId, roomUsers);

        // Assign role - first user is mentor
        const isMentor = !mentors.has(roomId);
        if (isMentor) {
            mentors.set(roomId, socket.id);
        }

        socket.emit('role-assigned', { isMentor });
        io.to(roomId).emit('user-count', roomUsers.size);
    });

    // Handle messages
    socket.on('send-message', ({ roomId, message, sender, role }) => {
        io.to(roomId).emit('receive-message', {
            message,
            sender,
            role,
            timestamp: new Date()
        });
    });

    // Handle code changes
    socket.on('code-change', ({ roomId, code }) => {
        socket.to(roomId).emit('code-update', code);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        connectedUsers.forEach((users, roomId) => {
            if (users.has(socket.id)) {
                users.delete(socket.id);

                // If mentor disconnected
                if (mentors.get(roomId) === socket.id) {
                    mentors.delete(roomId);
                    // Notify all users in the room that mentor left
                    io.to(roomId).emit('mentor-left');
                    // Clear the room
                    connectedUsers.delete(roomId);
                } else if (users.size > 0) {
                    // Update user count for remaining users
                    io.to(roomId).emit('user-count', users.size);
                }
            }
        });
    });
});

// Catch all other routes in production and return the React app
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 