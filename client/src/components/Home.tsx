import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket, connectSocket } from '../services/socket';
import { Board } from '../types';

const Home = () => {
  const navigate = useNavigate();
  const [boards, setBoards] = useState<Board[]>([]);
  const [newBoardName, setNewBoardName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {

    connectSocket();

    const fetchBoards = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:3000/api/boards');
        if (!response.ok) {
          throw new Error('Failed to fetch boards');
        }
        const data = await response.json();
        console.log('Fetched boards:', data);
        setBoards(data);
      } catch (error) {
        console.error('Error fetching boards:', error);
        setError('Failed to load boards');
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();

    socket.on('boards-update', (updatedBoards: Board[]) => {
      console.log('Received boards update:', updatedBoards);
      setBoards(updatedBoards);
    });

    socket.on('board-removed', (boardName: string) => {
      console.log('Board removed:', boardName);
      setBoards(prevBoards => prevBoards.filter(board => board.name !== boardName));
    });

    return () => {
      socket.off('boards-update');
      socket.off('board-removed');
    };
  }, []);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    try {
      setIsCreating(true);
      setError(null);
      console.log('Creating board:', newBoardName);
      const response = await fetch('http://localhost:3000/api/boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newBoardName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create board');
      }

      const newBoard = await response.json();
      console.log('Board created:', newBoard);
      setBoards(prevBoards => [...prevBoards, newBoard]);
      setNewBoardName('');
      navigate(`/board/${newBoard.name}`);
    } catch (error) {
      console.error('Error creating board:', error);
      setError(error instanceof Error ? error.message : 'Failed to create board');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinBoard = (boardName: string) => {
    console.log('Joining board:', boardName);
    navigate(`/board/${boardName}`);
  };

  return (
    <div className="min-h-screen p-5 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-64 h-64 top-1/4 right-1/4 bg-teal-400/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute w-64 h-64 bottom-1/4 left-1/4 bg-cyan-400/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }}></div>
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          ></div>
        ))}
      </div>
      
      {/* Content */}
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center">
            <h1 className="text-5xl font-bold text-white">We Doodle</h1>
            <span className="ml-3 px-3 py-1 bg-white/10 text-white text-sm rounded-full backdrop-blur-sm">
              Collaborative Drawing
            </span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-300 flex items-center gap-2 backdrop-blur-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 mb-8 shadow-xl border border-white/10">
          <h2 className="text-2xl font-semibold text-white mb-4">Create New Board</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 text-red-200 rounded-lg border border-red-500/30">
              {error}
            </div>
          )}
          <form onSubmit={handleCreateBoard} className="flex gap-4">
            <input
              type="text"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              placeholder="Enter board name"
              className="flex-1 p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={isCreating}
              className={`px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all duration-300 flex items-center gap-2 ${isCreating ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isCreating ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-white/10">
          <h2 className="text-2xl font-semibold text-white mb-6">Available Boards</h2>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : boards.length === 0 ? (
            <div className="text-center py-12 text-white/70">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-xl">No boards available</p>
              <p className="mt-2">Create a new board to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards.map((board) => (
                <div
                  key={board.name}
                  className="bg-white/5 border border-white/10 rounded-lg p-5 hover:bg-white/10 hover:border-white/20 cursor-pointer transition-all duration-300 group"
                  onClick={() => handleJoinBoard(board.name)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-white group-hover:text-teal-300 transition-colors">{board.name}</h3>
                    <span className="px-2 py-1 bg-teal-500/20 text-teal-200 text-xs rounded-full">
                      {board.userCount} {board.userCount === 1 ? 'user' : 'users'}
                    </span>
                  </div>
                  <div className="flex items-center text-white/70 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    Active now
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Add keyframes for floating animation */}
      <style>
        {`
          @keyframes float {
            0% {
              transform: translateY(0) translateX(0);
              opacity: 0;
            }
            10% {
              opacity: 0.8;
            }
            90% {
              opacity: 0.8;
            }
            100% {
              transform: translateY(-100px) translateX(20px);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Home; 