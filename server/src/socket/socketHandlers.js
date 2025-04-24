const { getBoard, hasBoardStateChanged, broadcastUserList, checkAndRemoveEmptyBoard, sendBoardUpdatesToClient, broadcastBoardUpdates } = require('../utils/boardUtils');
const { userSessions } = require('../utils/sessionUtils');

// Store boards by name
const boards = new Map();

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    let currentBoardName = null;

    // Send initial boards list to new connection
    sendBoardUpdatesToClient(socket, boards);

    socket.on('join-board', (boardName) => {
      console.log('User joining board:', boardName);
      currentBoardName = boardName;
      // Join the socket room for this board
      socket.join(boardName);
      const board = getBoard(boards, boardName);
      
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
    });

    socket.on('user-join', ({ username, boardName }) => {
      console.log('User joining:', username, 'board:', boardName);
      const userId = socket.id;
      const board = getBoard(boards, boardName);
      
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
      broadcastUserList(io, boardName, board);
      
      // Send existing drawings to the new user
      const drawings = board.drawingHistory || [];
      socket.emit('load-drawings', drawings);
      
      // Only broadcast board updates when a user joins and state has changed
      if (hasBoardStateChanged(boards, boardName)) {
        broadcastBoardUpdates(io, boards);
      }
    });

    socket.on('draw', (drawingData) => {
      if (!currentBoardName) return;
      
      const board = getBoard(boards, currentBoardName);
      
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
      
      const board = getBoard(boards, currentBoardName);
      // Clear the drawing history
      board.drawingHistory = [];
      // Broadcast clear canvas event to all clients in the same board
      io.to(currentBoardName).emit('clear-canvas');
    });

    socket.on('color-change', ({ color }) => {
      const username = socket.username;
      if (username) {
        const board = getBoard(boards, currentBoardName);
        const previousColor = board.userColors[socket.id];
        
        // Only update and broadcast if the color has actually changed
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
          if (hasBoardStateChanged(boards, currentBoardName)) {
            broadcastBoardUpdates(io, boards);
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
          
          // Check if board should be removed
          checkAndRemoveEmptyBoard(io, boards, currentBoardName);
          
          // Only broadcast board updates if state has changed
          if (hasBoardStateChanged(boards, currentBoardName)) {
            broadcastBoardUpdates(io, boards);
          }
        }
      }
    });
  });
}

module.exports = { setupSocketHandlers }; 