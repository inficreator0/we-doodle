# We Doodle - Real-time Collaborative Whiteboard

A real-time collaborative whiteboard application where multiple users can draw together. Built with React, Socket.IO, and HTML5 Canvas.

## Features

- Real-time drawing synchronization
- Multiple user support
- Color picker
- Clear canvas functionality
- Active users list
- Modern, responsive UI

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm run install-all
```

## Running the Application

1. Start both the server and client:

```bash
npm start
```

This will start:

- Backend server on http://localhost:3000
- Frontend client on http://localhost:5173

## How to Use

1. Open http://localhost:5173 in your browser
2. Enter your name and click "Join Whiteboard"
3. Start drawing! Your drawings will be synchronized with other users in real-time
4. Use the color picker to change colors
5. Use the "Clear Canvas" button to clear the whiteboard

## Tech Stack

- Frontend:
  - React
  - Vite
  - Tailwind CSS
  - Socket.IO Client

- Backend:
  - Node.js
  - Express
  - Socket.IO
  - CORS
