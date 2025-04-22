import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReducer } from 'react';
import { 
  boardReducer, 
  SET_USERNAME, 
  SET_JOINED, 
  SET_USERS, 
  SET_COLOR, 
  SET_THICKNESS, 
  SET_ERASER_SIZE, 
  SET_IS_DRAWING, 
  SET_IS_ERASER, 
  SET_MOUSE_POSITION, 
  UPDATE_USER_COLOR, 
  CLEAR_CANVAS 
} from '../reducers/boardReducer';
import { socket } from '../services/socket';
import ActiveUsers from './ActiveUsers';
import DrawingTools from './DrawingTools';
import Canvas from './Canvas';

function Board() {
  const { boardName } = useParams();
  const navigate = useNavigate();

  const [state, dispatch] = useReducer(boardReducer, {
    username: '',
    isJoined: false,
    users: [],
    userColors: {},
    color: '#000000',
    thickness: 3,
    eraserSize: 20,
    isDrawing: false,
    isEraser: false,
    mousePosition: { x: 0, y: 0 }
  });

  const canvasRef = useRef(null);
  const eraserCanvasRef = useRef(null);
  const contextRef = useRef(null);
  const eraserContextRef = useRef(null);
  const lastPoint = useRef(null);
  const currentColorRef = useRef('#000000');
  const currentThicknessRef = useRef(3);
  const currentEraserSizeRef = useRef(20);
  const canvasWrapperRef = useRef(null);
  const previewRef = useRef(null);

  const [userColors, setUserColors] = useState({});

  const handleJoin = (e) => {
    e.preventDefault();
    if (state.username.trim()) {
      console.log('Joining board with username:', state.username);
      // First emit the user-join event
      socket.emit('user-join', { username: state.username, boardName });
      // Then emit the color-change event
      socket.emit('color-change', { color: currentColorRef.current });
      // Set joined state immediately to trigger the useEffect
      dispatch({ type: SET_JOINED, payload: true });
    }
  };

  const handleColorChange = (newColor) => {
    currentColorRef.current = newColor;
    dispatch({ type: SET_COLOR, payload: newColor });
    if (contextRef.current) {
      contextRef.current.strokeStyle = newColor;
    }
    // Update local userColors state immediately
    setUserColors(prev => ({
      ...prev,
      [state.username]: newColor
    }));
    // Emit color change to server
    socket.emit('color-change', { color: newColor });
  };

  const handleThicknessChange = (e) => {
    const newThickness = parseInt(e.target.value);
    dispatch({ type: SET_THICKNESS, payload: newThickness });
    currentThicknessRef.current = newThickness;
    if (contextRef.current) {
      contextRef.current.lineWidth = newThickness;
    }
  };

  const handleEraserSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    dispatch({ type: SET_ERASER_SIZE, payload: newSize });
    currentEraserSizeRef.current = newSize;
    if (eraserContextRef.current && state.isEraser) {
      eraserContextRef.current.lineWidth = newSize;
    }
  };

  const toggleEraser = () => {
    dispatch({ type: SET_IS_ERASER, payload: !state.isEraser });
  };

  const startDrawing = ({ nativeEvent }) => {
    if (!contextRef.current || !eraserContextRef.current) return;
    
    const { offsetX, offsetY } = nativeEvent;
    lastPoint.current = { x: offsetX, y: offsetY };
    
    const context = state.isEraser ? eraserContextRef.current : contextRef.current;
    
    context.beginPath();
    context.strokeStyle = state.isEraser ? '#000000' : currentColorRef.current;
    context.lineWidth = state.isEraser ? currentEraserSizeRef.current : currentThicknessRef.current;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.moveTo(offsetX, offsetY);
    
    dispatch({ type: SET_IS_DRAWING, payload: true });
  };

  const draw = ({ nativeEvent }) => {
    if (!state.isDrawing || !contextRef.current || !eraserContextRef.current) return;
    
    const { offsetX, offsetY } = nativeEvent;
    const currentPoint = { x: offsetX, y: offsetY };
    
    const context = state.isEraser ? eraserContextRef.current : contextRef.current;
    
    context.lineTo(offsetX, offsetY);
    context.stroke();

    socket.emit('draw', {
      points: [lastPoint.current, currentPoint],
      color: currentColorRef.current,
      thickness: currentThicknessRef.current,
      isEraser: state.isEraser
    });

    lastPoint.current = currentPoint;
  };

  const endDrawing = () => {
    if (!state.isDrawing || !contextRef.current || !eraserContextRef.current) return;
    
    const context = state.isEraser ? eraserContextRef.current : contextRef.current;
    context.closePath();
    dispatch({ type: SET_IS_DRAWING, payload: false });
    lastPoint.current = null;
  };

  const clearCanvas = () => {
    if (!canvasRef.current || !eraserCanvasRef.current) return;
    
    const canvas = canvasRef.current;
    const eraserCanvas = eraserCanvasRef.current;
    const context = canvas.getContext('2d');
    const eraserContext = eraserCanvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    eraserContext.clearRect(0, 0, eraserCanvas.width, eraserCanvas.height);
    socket.emit('clear-canvas');
  };

  const handleMouseMove = (e) => {
    if (!canvasWrapperRef.current) return;
    const rect = canvasWrapperRef.current.getBoundingClientRect();
    dispatch({ 
      type: SET_MOUSE_POSITION, 
      payload: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    });
  };

  useEffect(() => {
    if (state.isJoined) {
      // Join the board room
      socket.emit('join-board', boardName);
      console.log('Joining board:', boardName);

      const canvas = canvasRef.current;
      const eraserCanvas = eraserCanvasRef.current;
      if (!canvas || !eraserCanvas) return;

      // Set initial canvas size
      const updateCanvasSize = () => {
        if (!canvas || !eraserCanvas || !canvasWrapperRef.current) return;
        
        const wrapper = canvasWrapperRef.current;
        const rect = wrapper.getBoundingClientRect();
        
        // Store the current drawings
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempContext = tempCanvas.getContext('2d');
        tempContext.drawImage(canvas, 0, 0);
        
        // Set canvas dimensions
        canvas.width = rect.width;
        canvas.height = rect.height;
        eraserCanvas.width = rect.width;
        eraserCanvas.height = rect.height;
        
        // Setup main canvas context
        const context = canvas.getContext('2d');
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.strokeStyle = currentColorRef.current;
        context.lineWidth = currentThicknessRef.current;
        contextRef.current = context;
        
        // Restore the drawings
        context.drawImage(tempCanvas, 0, 0);
        
        // Setup eraser canvas context
        const eraserContext = eraserCanvas.getContext('2d');
        eraserContext.lineCap = 'round';
        eraserContext.lineJoin = 'round';
        eraserContext.strokeStyle = '#000000';
        eraserContext.lineWidth = currentEraserSizeRef.current;
        eraserContext.globalCompositeOperation = 'destination-out';
        eraserContextRef.current = eraserContext;
      };

      updateCanvasSize();
      window.addEventListener('resize', updateCanvasSize);

      // Socket event listeners
      socket.on('load-drawings', (drawings) => {
        console.log('Loading drawings:', drawings.length);
        if (!canvas) return;
        
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        drawings.forEach(draw => {
          const { points, color, thickness } = draw;
          context.beginPath();
          context.strokeStyle = color;
          context.lineWidth = thickness;
          context.lineCap = 'round';
          context.lineJoin = 'round';
          context.moveTo(points[0].x, points[0].y);
          context.lineTo(points[1].x, points[1].y);
          context.stroke();
        });
      });

      socket.on('draw', (drawingData) => {
        if (!contextRef.current) return;
        
        const { points, color, thickness, isEraser } = drawingData;
        const context = isEraser ? eraserContextRef.current : contextRef.current;
        
        if (!context) return;
        
        context.beginPath();
        context.strokeStyle = isEraser ? '#000000' : color;
        context.lineWidth = isEraser ? currentEraserSizeRef.current : thickness;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.moveTo(points[0].x, points[0].y);
        context.lineTo(points[1].x, points[1].y);
        context.stroke();
      });

      socket.on('clear-canvas', () => {
        if (!canvas || !eraserCanvas) return;
        
        const context = canvas.getContext('2d');
        const eraserContext = eraserCanvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        eraserContext.clearRect(0, 0, eraserCanvas.width, eraserCanvas.height);
        dispatch({ type: CLEAR_CANVAS });
      });

      socket.on('user-list', (userList) => {
        console.log('User list updated:', userList);
        // Ensure the current user is in the list
        if (!userList.includes(state.username)) {
          userList = [...userList, state.username];
        }
        dispatch({ type: SET_USERS, payload: userList });
      });

      socket.on('user-color-update', ({ username, color }) => {
        console.log('Color update:', username, color);
        if (color) {
          setUserColors(prev => ({
            ...prev,
            [username]: color
          }));
        } else {
          setUserColors(prev => {
            const newColors = { ...prev };
            delete newColors[username];
            return newColors;
          });
        }
      });

      socket.on('join-confirmed', () => {
        console.log('Join confirmed for board:', boardName);
        // Re-emit user-join to ensure the server has the latest user info
        socket.emit('user-join', { username: state.username, boardName });
      });

      return () => {
        window.removeEventListener('resize', updateCanvasSize);
        socket.off('load-drawings');
        socket.off('draw');
        socket.off('clear-canvas');
        socket.off('user-list');
        socket.off('user-color-update');
        socket.off('join-confirmed');
      };
    }
  }, [state.isJoined, boardName, state.username]);

  if (!state.isJoined) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-5 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
        <div className="absolute top-1/5 left-1/10 w-24 h-24 bg-white/10 rounded-full animate-float" />
        <div className="absolute top-3/5 right-1/6 w-36 h-36 bg-white/10 rounded-full animate-float [animation-delay:2s]" />
        <div className="absolute bottom-1/5 left-1/5 w-20 h-20 bg-white/10 rounded-full animate-float [animation-delay:4s]" />
        
        <h1 className="text-5xl font-bold text-white mb-8 text-center animate-fade-in drop-shadow-lg">
          We Doodle
        </h1>
        <p className="text-xl text-white/90 mb-8 text-center animate-fade-in [animation-delay:300ms]">
          Join the collaborative drawing experience
        </p>
        
        <form onSubmit={handleJoin} className="w-full max-w-md space-y-4 animate-fade-in [animation-delay:600ms]">
          <input
            type="text"
            placeholder="Enter your name"
            value={state.username}
            onChange={(e) => dispatch({ type: SET_USERNAME, payload: e.target.value })}
            required
            className="input-primary bg-white/90 shadow-lg"
          />
          <button
            type="submit"
            className="btn btn-primary w-full bg-green-500 hover:bg-green-600 text-lg font-semibold"
          >
            Join Board: {boardName}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-5 bg-gradient-to-br from-indigo-500 to-purple-600">
      <header className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">We Doodle</h1>
          <span className="text-white/80">|</span>
          <span className="text-white">{boardName}</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              const boardUrl = `${window.location.origin}/board/${boardName}`;
              navigator.clipboard.writeText(boardUrl);
              alert('Board link copied to clipboard!');
            }}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            Share Board
          </button>
        </div>
      </header>
      
      <div className="flex flex-1 gap-5">
        <ActiveUsers users={state.users} userColors={userColors} />
        
        <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden relative">
          <Canvas
            canvasRef={canvasRef}
            eraserCanvasRef={eraserCanvasRef}
            canvasWrapperRef={canvasWrapperRef}
            previewRef={previewRef}
            isEraser={state.isEraser}
            eraserSize={state.eraserSize}
            mousePosition={state.mousePosition}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            onMouseMoveTrack={handleMouseMove}
          />
        </div>
      </div>
      
      <DrawingTools
        color={state.color}
        thickness={state.thickness}
        onColorChange={handleColorChange}
        onThicknessChange={handleThicknessChange}
        onClearCanvas={clearCanvas}
      />
    </div>
  );
}

export default Board; 