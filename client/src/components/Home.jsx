import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../services/socket';

function Home() {
  const [boards, setBoards] = useState([]);
  const [newBoardName, setNewBoardName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Initial fetch of boards
    fetchBoards();

    // Listen for board updates
    socket.on('boards-update', (updatedBoards) => {
      console.log('Received boards update:', updatedBoards);
      setBoards(updatedBoards);
    });

    // Listen for board removal events
    socket.on('board-removed', (boardName) => {
      console.log('Board removed:', boardName);
      setBoards(prevBoards => prevBoards.filter(board => board.name !== boardName));
    });

    return () => {
      socket.off('boards-update');
      socket.off('board-removed');
    };
  }, []);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/boards');
      const data = await response.json();
      setBoards(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching boards:', error);
      setLoading(false);
    }
  };

  const handleCreateBoard = (e) => {
    e.preventDefault();
    if (newBoardName.trim()) {
      navigate(`/board/${newBoardName.trim()}`);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="text-white text-xl">Loading boards...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg">We Doodle</h1>
          <button 
            onClick={fetchBoards}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-200"
          >
            Refresh
          </button>
        </div>
        
        <div className="bg-gray-900 rounded-2xl shadow-xl p-8 mb-8 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-6 text-gray-100">Create New Board</h2>
          <form onSubmit={handleCreateBoard} className="flex gap-4">
            <input
              type="text"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              placeholder="Enter board name"
              className="flex-1 px-6 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-200 font-medium"
            >
              Create Board
            </button>
          </form>
        </div>

        <div className="bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-6 text-gray-100">Available Boards</h2>
          {boards.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No boards available. Create one above!</p>
          ) : (
            <div className="grid gap-4">
              {boards.map((board) => (
                <div
                  key={board.name}
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-6 transition-all duration-200 cursor-pointer"
                  onClick={() => navigate(`/board/${board.name}`)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-100">{board.name}</h3>
                      <p className="text-gray-400 text-sm mt-1">
                        Created: {formatDate(board.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-indigo-400 font-medium">
                        {board.userCount} {board.userCount === 1 ? 'user' : 'users'} active
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {board.activeUsers.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home; 