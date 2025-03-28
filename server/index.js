const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const initializeDatabase = require('./init/initialData');

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS configuration
const allowedOrigins = [
    'https://js-master-xi.vercel.app',
    'http://localhost:3000',
    'https://js-master.onrender.com'
];

// Configure Socket.IO with CORS
const io = socketIo(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Content-Type"]
    },
    transports: ['websocket'],
    path: '/socket.io/'
});

// Configure Express CORS
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('CORS policy violation'), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
}));

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/code-blocks')
    .then(() => {
        console.log('Connected to MongoDB');
        initializeDatabase();
    })
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
const codeBlockRoutes = require('./routes/codeBlocks');
app.use('/api/code-blocks', codeBlockRoutes);

// Socket.io connection handling
const connectedUsers = new Map(); 
const mentors = new Map(); 

io.on('connection', (socket) => {
    console.log('New client connected');

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

    // Chat message handling
    socket.on('send-message', ({ roomId, message, sender, role }) => {
        console.log('Server received message:', { roomId, message, sender, role });
        const messageData = {
            message,
            sender,
            role,
            timestamp: new Date().toISOString()
        };
        console.log('Server sending message to room:', roomId, messageData);
        io.to(roomId).emit('receive-message', messageData);
    });

    socket.on('code-change', ({ roomId, code }) => {
        io.to(roomId).emit('code-update', code);
    });

    socket.on('disconnect', () => {
        // Check all rooms for the disconnected user
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 