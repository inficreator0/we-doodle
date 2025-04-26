// Store boards by name
const boards = new Map()
// Store previous board states for comparison
const previousBoardStates = new Map()

// Helper function to get or create a board
function getBoard(boards, boardName) {
  if (!boards.has(boardName)) {
    console.log('Creating new board:', boardName)
    boards.set(boardName, {
      activeUsers: new Map(),
      drawingHistory: [],
      userColors: {},
      createdAt: new Date(),
    })
  }
  return boards.get(boardName)
}

// Helper function to check if board state has changed
function hasBoardStateChanged(boards, boardName) {
  const board = boards.get(boardName)
  if (!board) return false

  const currentState = {
    userCount: board.activeUsers.size,
    activeUsers: Array.from(board.activeUsers.values()),
    userColors: { ...board.userColors },
  }

  const previousState = previousBoardStates.get(boardName)

  // If no previous state exists, this is a new board
  if (!previousState) {
    previousBoardStates.set(boardName, currentState)
    return true
  }

  // Check if any relevant state has changed
  const hasChanged =
    currentState.userCount !== previousState.userCount ||
    JSON.stringify(currentState.activeUsers) !==
      JSON.stringify(previousState.activeUsers) ||
    JSON.stringify(currentState.userColors) !==
      JSON.stringify(previousState.userColors)

  // Update previous state
  previousBoardStates.set(boardName, currentState)

  return hasChanged
}

// Helper function to broadcast user list
function broadcastUserList(io, boardName, board) {
  const userList = Array.from(board.activeUsers.values())
  console.log('Broadcasting user list for board:', boardName, userList)
  io.to(boardName).emit('user-list', userList)
}

// Helper function to check and remove empty boards
function checkAndRemoveEmptyBoard(io, boards, boardName) {
  const board = boards.get(boardName)
  if (board && board.activeUsers.size === 0) {
    console.log(`Removing empty board: ${boardName}`)
    boards.delete(boardName)
    previousBoardStates.delete(boardName)
    io.emit('board-removed', boardName)
  }
}

// Helper function to broadcast board updates to specific clients
function sendBoardUpdatesToClient(socket, boards) {
  const boardsList = Array.from(boards.entries()).map(([name, board]) => ({
    name,
    activeUsers: Array.from(board.activeUsers.values()),
    userCount: board.activeUsers.size,
    createdAt: board.createdAt,
  }))
  socket.emit('boards-update', boardsList)
}

// Helper function to broadcast board updates to all clients
function broadcastBoardUpdates(io, boards) {
  // Only broadcast if any board has changed
  let hasAnyBoardChanged = false

  const boardsList = Array.from(boards.entries()).map(([name, board]) => {
    const hasChanged = hasBoardStateChanged(boards, name)
    if (hasChanged) {
      hasAnyBoardChanged = true
    }

    return {
      name,
      activeUsers: Array.from(board.activeUsers.values()),
      userCount: board.activeUsers.size,
      createdAt: board.createdAt,
    }
  })

  // Only broadcast if there are actual changes
  if (hasAnyBoardChanged) {
    console.log('Broadcasting board updates due to state changes')
    io.emit('boards-update', boardsList)
  } else {
    console.log('No board state changes detected, skipping broadcast')
  }
}

module.exports = {
  boards,
  getBoard,
  hasBoardStateChanged,
  broadcastUserList,
  checkAndRemoveEmptyBoard,
  sendBoardUpdatesToClient,
  broadcastBoardUpdates,
}
