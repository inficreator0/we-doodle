import React, { FormEvent, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useReducer } from 'react'
import {
  boardReducer,
  SET_USERNAME,
  SET_JOINED,
  SET_USERS,
  SET_COLOR,
  SET_THICKNESS,
  SET_IS_DRAWING,
  SET_MOUSE_POSITION,
  UPDATE_USER_COLOR,
  initialState,
} from '../reducers/boardReducer'
import { socket, connectSocket } from '../services/socket'
import { ActiveUsers } from './ActiveUsers'
import { Canvas } from './Canvas'
import { Point, DrawingData } from '../types'
import { DrawingTools } from './DrawingTools'

const Board = () => {
  const { boardName } = useParams<{ boardName: string }>()

  const [state, dispatch] = useReducer(boardReducer, initialState)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const lastPoint = useRef<Point | null>(null)
  const currentColorRef = useRef<string>('#000000')
  const currentThicknessRef = useRef<number>(3)
  const canvasWrapperRef = useRef<HTMLDivElement | null>(null)
  const previewRef = useRef<HTMLCanvasElement | null>(null)

  const handleJoin = (e: FormEvent): void => {
    e.preventDefault()
    if (state.username.trim()) {
      socket.emit('user-join', { username: state.username, boardName })
      socket.emit('color-change', { color: currentColorRef.current })
      dispatch({ type: SET_JOINED, payload: true })
    }
  }

  const handleColorChange = (newColor: string): void => {
    currentColorRef.current = newColor
    dispatch({ type: SET_COLOR, payload: newColor })
    if (contextRef.current) {
      contextRef.current.strokeStyle = newColor
    }
    dispatch({
      type: UPDATE_USER_COLOR,
      payload: { username: state.username, color: newColor },
    })
    socket.emit('color-change', { color: newColor })
  }

  const handleThicknessChange = (newThickness: number): void => {
    dispatch({ type: SET_THICKNESS, payload: newThickness })
    currentThicknessRef.current = newThickness
    if (contextRef.current) {
      contextRef.current.lineWidth = newThickness
    }
  }

  const startDrawing = ({
    nativeEvent,
  }: React.MouseEvent<HTMLCanvasElement>): void => {
    if (!contextRef.current) return

    const { offsetX, offsetY } = nativeEvent
    lastPoint.current = { x: offsetX, y: offsetY }

    contextRef.current.beginPath()
    contextRef.current.strokeStyle = currentColorRef.current
    contextRef.current.lineWidth = currentThicknessRef.current
    contextRef.current.lineCap = 'round'
    contextRef.current.lineJoin = 'round'
    contextRef.current.moveTo(offsetX, offsetY)

    dispatch({ type: SET_IS_DRAWING, payload: true })
  }

  const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>): void => {
    if (!contextRef.current || !lastPoint.current) return

    const { offsetX, offsetY } = nativeEvent
    const currentPoint = { x: offsetX, y: offsetY }

    contextRef.current.lineTo(offsetX, offsetY)
    contextRef.current.stroke()

    const drawingData: DrawingData = {
      points: [lastPoint.current, currentPoint],
      color: currentColorRef.current,
      thickness: currentThicknessRef.current,
      isEraser: false,
      username: state.username,
      timestamp: Date.now(),
    }

    socket.emit('draw', drawingData)
    lastPoint.current = currentPoint
  }

  const endDrawing = (): void => {
    if (!state.isDrawing || !contextRef.current) return

    contextRef.current.closePath()
    dispatch({ type: SET_IS_DRAWING, payload: false })
    lastPoint.current = null
  }

  const clearCanvas = (): void => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    context.clearRect(0, 0, canvas.width, canvas.height)
    socket.emit('clear-canvas')
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (!canvasWrapperRef.current) return
    const rect = canvasWrapperRef.current.getBoundingClientRect()
    dispatch({
      type: SET_MOUSE_POSITION,
      payload: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      },
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !canvasWrapperRef.current) return

    const wrapper = canvasWrapperRef.current
    const rect = wrapper.getBoundingClientRect()

    // Set canvas dimensions
    canvas.width = rect.width
    canvas.height = rect.height

    // Setup main canvas context
    const context = canvas.getContext('2d')
    if (!context) return

    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle = currentColorRef.current
    context.lineWidth = currentThicknessRef.current
    contextRef.current = context

    // Load existing drawings when joining a board
    if (state.isJoined && boardName) {
      socket.emit('join-board', boardName)
      console.log('Joining board:', boardName)
    }
  }, [state.isJoined, boardName])

  useEffect(() => {
    if (state.isJoined && boardName) {
      const canvas = canvasRef.current
      if (!canvas) return

      const updateCanvasSize = (): void => {
        if (!canvas || !canvasWrapperRef.current) return

        const wrapper = canvasWrapperRef.current
        const rect = wrapper.getBoundingClientRect()

        // Save current drawings
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = canvas.width
        tempCanvas.height = canvas.height
        const tempContext = tempCanvas.getContext('2d')
        if (!tempContext) return

        tempContext.drawImage(canvas, 0, 0)

        // Set new dimensions
        canvas.width = rect.width
        canvas.height = rect.height

        const context = canvas.getContext('2d')
        if (!context) return

        context.lineCap = 'round'
        context.lineJoin = 'round'
        context.strokeStyle = currentColorRef.current
        context.lineWidth = currentThicknessRef.current
        contextRef.current = context

        // Restore drawings
        context.drawImage(tempCanvas, 0, 0)
      }

      updateCanvasSize()
      window.addEventListener('resize', updateCanvasSize)

      socket.on('load-drawings', (drawings: DrawingData[]) => {
        console.log('Loading drawings:', drawings.length)
        if (!canvas) return

        const context = canvas.getContext('2d')
        if (!context) return

        context.clearRect(0, 0, canvas.width, canvas.height)

        drawings.forEach((draw) => {
          const { points, color, thickness } = draw

          context.beginPath()
          context.strokeStyle = color
          context.lineWidth = thickness
          context.lineCap = 'round'
          context.lineJoin = 'round'
          context.moveTo(points[0].x, points[0].y)
          context.lineTo(points[1].x, points[1].y)
          context.stroke()
        })
      })

      socket.on('draw', (drawingData: DrawingData) => {
        console.log('Received drawing data:', drawingData)
        if (!contextRef.current) return

        const { points, color, thickness } = drawingData

        contextRef.current.beginPath()
        contextRef.current.strokeStyle = color
        contextRef.current.lineWidth = thickness
        contextRef.current.lineCap = 'round'
        contextRef.current.lineJoin = 'round'
        contextRef.current.moveTo(points[0].x, points[0].y)
        contextRef.current.lineTo(points[1].x, points[1].y)
        contextRef.current.stroke()
      })

      socket.on('clear-canvas', () => {
        if (!canvas) return

        const context = canvas.getContext('2d')
        if (!context) return

        context.clearRect(0, 0, canvas.width, canvas.height)
      })

      socket.on(
        'user-color-update',
        ({ username, color }: { username: string; color: string }) => {
          console.log('Received color update:', username, color)
          dispatch({
            type: UPDATE_USER_COLOR,
            payload: { username, color },
          })
        }
      )

      return () => {
        window.removeEventListener('resize', updateCanvasSize)
        socket.off('load-drawings')
        socket.off('draw')
        socket.off('clear-canvas')
        socket.off('user-color-update')
      }
    }
  }, [state.isJoined, boardName])

  // Ensure socket is connected when this component mounts
  useEffect(() => {
    connectSocket()
  }, [])

  // Mount-level listener for user-list updates
  useEffect(() => {
    const handleUserList = (users: string[]) => {
      console.log('Received user-list:', users)
      dispatch({ type: SET_USERS, payload: users })
    }

    socket.on('user-list', handleUserList)

    return () => {
      socket.off('user-list', handleUserList)
    }
  }, [])

  // Listen for drawing events from other users and render them
  useEffect(() => {
    const handleRemoteDraw = (drawingData: DrawingData) => {
      if (!contextRef.current) return
      const { points, color, thickness } = drawingData
      contextRef.current.beginPath()
      contextRef.current.strokeStyle = color
      contextRef.current.lineWidth = thickness
      contextRef.current.lineCap = 'round'
      contextRef.current.lineJoin = 'round'
      contextRef.current.moveTo(points[0].x, points[0].y)
      contextRef.current.lineTo(points[1].x, points[1].y)
      contextRef.current.stroke()
    }
    socket.on('draw', handleRemoteDraw)
    return () => {
      socket.off('draw', handleRemoteDraw)
    }
  }, [])

  if (!state.isJoined) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-5 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 -top-48 -left-48 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute w-96 h-96 -bottom-48 -right-48 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '1s' }}
          ></div>
          <div
            className="absolute w-64 h-64 top-1/4 right-1/4 bg-teal-400/5 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: '2s' }}
          ></div>
          <div
            className="absolute w-64 h-64 bottom-1/4 left-1/4 bg-cyan-400/5 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: '3s' }}
          ></div>

          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${5 + Math.random() * 10}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            ></div>
          ))}
        </div>

        <div className="relative z-10 w-full max-w-md">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            Join Board
          </h1>
          <form
            onSubmit={handleJoin}
            className="w-full bg-white/5 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-white/10"
          >
            <input
              type="text"
              value={state.username}
              onChange={(e) =>
                dispatch({ type: SET_USERNAME, payload: e.target.value })
              }
              placeholder="Enter your name"
              className="w-full p-3 mb-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            />
            <button
              type="submit"
              className="w-full bg-teal-500 text-white p-3 rounded-lg font-semibold hover:bg-teal-600 transition-all duration-300"
            >
              Join
            </button>
          </form>
        </div>

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
    )
  }

  return (
    <div className="min-h-screen flex flex-col p-5 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute w-96 h-96 -bottom-48 -right-48 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute w-64 h-64 top-1/4 right-1/4 bg-teal-400/5 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute w-64 h-64 bottom-1/4 left-1/4 bg-cyan-400/5 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '3s' }}
        ></div>

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="flex-1 flex gap-5 relative z-10">
        <div className="w-64 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <ActiveUsers users={state.users} userColors={state.userColors} />
        </div>
        <div
          ref={canvasWrapperRef}
          className="flex-1 bg-white rounded-xl relative border border-white/10"
          onMouseMove={handleMouseMove}
        >
          <Canvas
            canvasRef={canvasRef}
            previewRef={previewRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
          />
        </div>
      </div>
      <div className="mt-5 relative z-10">
        <DrawingTools
          color={state.color}
          thickness={state.thickness}
          onColorChange={handleColorChange}
          onThicknessChange={handleThicknessChange}
          onClearCanvas={clearCanvas}
        />
      </div>

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
  )
}

export default Board
