import React from 'react';

const Eraser = ({ isEraser, onEraserToggle, eraserSize, onEraserSizeChange }) => {
  return (
    <div className="flex flex-col items-center gap-2 p-2 bg-white rounded-lg shadow">
      <button
        className={`p-2 rounded-lg transition-colors ${
          isEraser ? 'bg-gray-200' : 'hover:bg-gray-100'
        }`}
        onClick={onEraserToggle}
        title={isEraser ? 'Disable Eraser' : 'Enable Eraser'}
      >
        {isEraser ? (
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        )}
      </button>
      {isEraser && (
        <input
          type="range"
          min="5"
          max="50"
          value={eraserSize}
          onChange={(e) => onEraserSizeChange(Number(e.target.value))}
          className="w-24"
        />
      )}
    </div>
  );
};

export default Eraser; 