import React from 'react';

const Toolbar = ({
  color,
  onColorChange,
  lineWidth,
  onLineWidthChange,
  isEraser,
  onEraserToggle,
  eraserSize,
  onEraserSizeChange,
  onClearCanvas
}) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-white border-b border-gray-200">
      <input
        type="color"
        value={color}
        onChange={(e) => onColorChange(e.target.value)}
        className="w-10 h-10 p-1 border border-gray-300 rounded cursor-pointer"
      />
      
      <input
        type="range"
        min="1"
        max="20"
        value={lineWidth}
        onChange={(e) => onLineWidthChange(Number(e.target.value))}
        className="w-32"
      />
      
      <button
        onClick={onEraserToggle}
        className={`p-2 rounded ${
          isEraser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
        }`}
      >
        {isEraser ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        )}
      </button>
      
      {isEraser && (
        <input
          type="range"
          min="10"
          max="50"
          value={eraserSize}
          onChange={(e) => onEraserSizeChange(Number(e.target.value))}
          className="w-32"
        />
      )}
      
      <button
        onClick={onClearCanvas}
        className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600"
      >
        Clear Canvas
      </button>
    </div>
  );
};

export default Toolbar; 