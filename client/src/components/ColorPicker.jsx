import React from 'react';

const ColorPicker = ({ currentColor, onColorChange }) => {
  const colors = [
    '#000000', // Black
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFA500', // Orange
    '#800080', // Purple
    '#008000', // Dark Green
  ];

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-white rounded-lg shadow">
      {colors.map((color) => (
        <button
          key={color}
          className={`w-8 h-8 rounded-full border-2 transition-transform ${
            currentColor === color ? 'scale-110 border-gray-400' : 'border-transparent hover:scale-105'
          }`}
          style={{ backgroundColor: color }}
          onClick={() => onColorChange(color)}
          title={color}
        />
      ))}
    </div>
  );
};

export default ColorPicker; 