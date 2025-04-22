import React, { useEffect, useRef } from 'react';

const Canvas = ({
  canvasRef,
  eraserCanvasRef,
  canvasWrapperRef,
  isEraser,
  eraserSize,
  mousePosition,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onMouseMoveTrack
}) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    const eraserCanvas = eraserCanvasRef.current;
    const wrapper = canvasWrapperRef.current;
    
    if (!canvas || !eraserCanvas || !wrapper) return;

    // Set initial canvas size
    const updateCanvasSize = () => {
      const rect = wrapper.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      eraserCanvas.width = rect.width;
      eraserCanvas.height = rect.height;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [canvasRef, eraserCanvasRef, canvasWrapperRef]);

  return (
    <div ref={canvasWrapperRef} className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full touch-none"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchStart={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          const rect = canvasRef.current.getBoundingClientRect();
          onMouseDown({
            nativeEvent: {
              offsetX: touch.clientX - rect.left,
              offsetY: touch.clientY - rect.top
            }
          });
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          const rect = canvasRef.current.getBoundingClientRect();
          onMouseMove({
            nativeEvent: {
              offsetX: touch.clientX - rect.left,
              offsetY: touch.clientY - rect.top
            }
          });
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          onMouseUp();
        }}
      />
      <canvas
        ref={eraserCanvasRef}
        className="absolute top-0 left-0 w-full h-full touch-none pointer-events-none"
      />
    </div>
  );
};

export default Canvas; 