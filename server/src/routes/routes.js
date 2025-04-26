const { boards } = require('../utils/boardUtils')

function setupRoutes(app) {
  // Get list of available boards
  app.get('/api/boards', (req, res) => {
    console.log('Available boards:', Array.from(boards.keys()))
    const boardsList = Array.from(boards.entries()).map(([name, board]) => ({
      name,
      activeUsers: Array.from(board.activeUsers.values()),
      userCount: board.activeUsers.size,
      createdAt: board.createdAt,
    }))
    res.json(boardsList)
  })
}

module.exports = { setupRoutes }
