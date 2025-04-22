import React from 'react';

function DrawingTools({
  color,
  thickness,
  onColorChange,
  onThicknessChange,
  onClearCanvas
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left section - Color and thickness */}
          <div className="flex items-center space-x-4">
            {/* Color picker */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Color</label>
              <div className="relative">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                />
                <div 
                  className="absolute inset-0 rounded pointer-events-none"
                  style={{ 
                    backgroundColor: color,
                    opacity: 0.5,
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}
                />
              </div>
            </div>

            {/* Thickness selector */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Size</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={thickness}
                  onChange={(e) => onThicknessChange(Number(e.target.value))}
                  className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex items-center space-x-1">
                  <div 
                    className="w-4 h-4 rounded-full bg-gray-800"
                    style={{ 
                      width: `${Math.max(4, thickness)}px`,
                      height: `${Math.max(4, thickness)}px`
                    }}
                  />
                  <span className="text-sm text-gray-600 w-8">{thickness}px</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right section - Clear canvas button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onClearCanvas}
              className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
              title="Clear canvas"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DrawingTools; 