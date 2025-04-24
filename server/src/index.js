const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // Add JSON body parser

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite's default port
    methods: ["GET", "POST"]
  }
});

// Store boards by name
const boards = new Map();
// Store user sessions
const userSessions = new Map();
// Store previous board states for comparison
const previousBoardStates = new Map();

// Helper function to get or create a board
function getBoard(boardName) {
  if (!boards.has(boardName)) {
    console.log('Creating new board:', boardName);
    boards.set(boardName, {
      activeUsers: new Map(),
      drawingHistory: [],
      userColors: {},
      createdAt: new Date()
    });
  }
  return boards.get(boardName);
}

// Helper function to check if board state has changed
function hasBoardStateChanged(boardName) {
  const board = boards.get(boardName);
  if (!board) return false;
  
  const currentState = {
    userCount: board.activeUsers.size,
    activeUsers: Array.from(board.activeUsers.values()),
    userColors: {...board.userColors}
  };
  
  const previousState = previousBoardStates.get(boardName);
  
  // If no previous state exists, this is a new board
  if (!previousState) {
    previousBoardStates.set(boardName, currentState);
    return true;
  }
  
  // Check if any relevant state has changed
  const hasChanged = 
    currentState.userCount !== previousState.userCount ||
    JSON.stringify(currentState.activeUsers) !== JSON.stringify(previousState.activeUsers) ||
    JSON.stringify(currentState.userColors) !== JSON.stringify(previousState.userColors);
  
  // Update previous state
  previousBoardStates.set(boardName, currentState);
  
  return hasChanged;
}

// Helper function to broadcast user list
function broadcastUserList(boardName) {
  const board = getBoard(boardName);
  const userList = Array.from(board.activeUsers.values());
  console.log('Broadcasting user list for board:', boardName, userList);
  io.to(boardName).emit('user-list', userList);
}

// Helper function to check and remove empty boards
function checkAndRemoveEmptyBoard(boardName) {
  const board = boards.get(boardName);
  if (board && board.activeUsers.size === 0) {
    console.log(`Removing empty board: ${boardName}`);
    boards.delete(boardName);
    previousBoardStates.delete(boardName);
    io.emit('board-removed', boardName);
  }
}

// Helper function to broadcast board updates to specific clients
function sendBoardUpdatesToClient(socket) {
  const boardsList = Array.from(boards.entries()).map(([name, board]) => ({
    name,
    activeUsers: Array.from(board.activeUsers.values()),
    userCount: board.activeUsers.size,
    createdAt: board.createdAt
  }));
  socket.emit('boards-update', boardsList);
}

// Helper function to broadcast board updates to all clients
function broadcastBoardUpdates() {
  // Only broadcast if any board has changed
  let hasAnyBoardChanged = false;
  
  const boardsList = Array.from(boards.entries()).map(([name, board]) => {
    const hasChanged = hasBoardStateChanged(name);
    if (hasChanged) {
      hasAnyBoardChanged = true;
    }
    
    return {
      name,
      activeUsers: Array.from(board.activeUsers.values()),
      userCount: board.activeUsers.size,
      createdAt: board.createdAt
    };
  });
  
  // Only broadcast if there are actual changes
  if (hasAnyBoardChanged) {
    console.log('Broadcasting board updates due to state changes');
    io.emit('boards-update', boardsList);
  } else {
    console.log('No board state changes detected, skipping broadcast');
  }
}

// Get list of available boards
app.get('/api/boards', (req, res) => {
  console.log('Available boards:', Array.from(boards.keys()));
  // Remove boards with no active users before responding
  for (const name of Array.from(boards.keys())) {
    checkAndRemoveEmptyBoard(name);
  }
  const boardsList = Array.from(boards.entries()).map(([name, board]) => ({
    name,
    activeUsers: Array.from(board.activeUsers.values()),
    userCount: board.activeUsers.size,
    createdAt: board.createdAt
  }));
  res.json(boardsList);
});

// Create a new board
app.post('/api/boards', (req, res) => {
  console.log('Received create board request:', req.body);
  
  const { name } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim() === '') {
    console.log('Invalid board name:', name);
    return res.status(400).json({ error: 'Invalid board name' });
  }

  const boardName = name.trim();
  
  // Check if board already exists
  if (boards.has(boardName)) {
    console.log('Board already exists:', boardName);
    return res.status(409).json({ error: 'Board already exists' });
  }

  // Create new board
  console.log('Creating new board:', boardName);
  const board = {
    activeUsers: new Map(),
    drawingHistory: [],
    userColors: {},
    createdAt: new Date()
  };
  boards.set(boardName, board);

  // Broadcast board update to all clients
  const boardData = {
    name: boardName,
    activeUsers: [],
    userCount: 0,
    createdAt: board.createdAt
  };

  const boardsList = Array.from(boards.entries()).map(([name, board]) => ({
    name,
    activeUsers: Array.from(board.activeUsers.values()),
    userCount: board.activeUsers.size,
    createdAt: board.createdAt
  }));

  console.log('Broadcasting updated boards list:', boardsList);
  io.emit('boards-update', boardsList);

  console.log('Sending response for new board:', boardData);
  res.status(201).json(boardData);
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  let currentBoardName = null;

  // Send initial boards list to new connection
  sendBoardUpdatesToClient(socket);

  socket.on('join-board', (boardName) => {
    console.log('User joining board:', boardName);
    currentBoardName = boardName;
    socket.boardName = boardName;
    // Join the socket room for this board
    socket.join(boardName);
    const board = getBoard(boardName);
    
    // Send existing drawings to new user
    socket.emit('load-drawings', board.drawingHistory);
    
    // Send current users list
    const userList = Array.from(board.activeUsers.values());
    console.log('Sending initial user list:', userList);
    socket.emit('user-list', userList);
    
    // Send current user colors
    Object.entries(board.userColors).forEach(([userId, color]) => {
      const username = board.activeUsers.get(userId);
      if (username) {
        socket.emit('user-color-update', { username, color });
      }
    });
    // No need to broadcast board updates here
  });

  socket.on('user-join', ({ username, boardName }) => {
    console.log('User joining:', username, 'board:', boardName);
    const userId = socket.id;
    const board = getBoard(boardName);
    
    // Add user to active users
    board.activeUsers.set(userId, username);
    socket.username = username;
    
    // Store user session
    userSessions.set(userId, {
      username,
      boardName,
      color: board.userColors[userId] || '#000000'
    });
    
    // Join the board room
    socket.join(boardName);
    
    // Emit join confirmation to the user
    socket.emit('join-confirmed');
    
    // Broadcast updated user list to all users in the board
    broadcastUserList(boardName);
    
    // Send existing drawings to the new user
    const drawings = board.drawingHistory || [];
    socket.emit('load-drawings', drawings);
    
    // Only broadcast board updates when a user joins and state has changed
    if (hasBoardStateChanged(boardName)) {
      broadcastBoardUpdates();
    }
  });

  socket.on('draw', (drawingData) => {
    if (!currentBoardName) return;
    
    const board = getBoard(currentBoardName);
    
    // Add username to drawing data if not provided
    if (!drawingData.username && socket.username) {
      drawingData.username = socket.username;
    }
    
    // Store the drawing data
    if (!board.drawingHistory) {
      board.drawingHistory = [];
    }
    board.drawingHistory.push(drawingData);
    
    // Log the drawing event for debugging
    console.log(`Drawing event from ${drawingData.username || 'unknown user'} in board ${currentBoardName}`);
    
    // Broadcast to all clients in the same board (including sender)
    io.to(currentBoardName).emit('draw', drawingData);
  });

  socket.on('clear-canvas', () => {
    if (!currentBoardName) return;
    
    const board = getBoard(currentBoardName);
    // Clear the drawing history
    board.drawingHistory = [];
    // Broadcast clear canvas event to all clients in the same board
    io.to(currentBoardName).emit('clear-canvas');
  });

  socket.on('color-change', ({ color }) => {
    const username = socket.username;
    if (username) {
      const board = getBoard(currentBoardName);
      const previousColor = board.userColors[socket.id];
      
      if (previousColor !== color) {
        board.userColors[socket.id] = color;
        // Update user session with new color
        const session = userSessions.get(socket.id);
        if (session) {
          session.color = color;
          userSessions.set(socket.id, session);
        }
        io.to(currentBoardName).emit('user-color-update', { username, color });
        
        // Only broadcast board updates if state has changed
        if (hasBoardStateChanged(currentBoardName)) {
          broadcastBoardUpdates();
        }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const currentBoardName = socket.boardName;
    if (currentBoardName) {
      const board = boards.get(currentBoardName);
      if (board) {
        board.activeUsers.delete(socket.id);
        if (board.userColors) {
          delete board.userColors[socket.username];
        }
        console.log(`User ${socket.username} left board ${currentBoardName}`);
        socket.to(currentBoardName).emit('user-left', socket.username);
        
        // Broadcast updated user list after removal
        broadcastUserList(currentBoardName);
        
        // Check if board should be removed
        checkAndRemoveEmptyBoard(currentBoardName);
        
        // Only broadcast board updates if state has changed
        if (hasBoardStateChanged(currentBoardName)) {
          broadcastBoardUpdates();
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 