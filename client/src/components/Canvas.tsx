import React, { useEffect, useState } from 'react';

interface CanvasProps {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    previewRef: React.RefObject<HTMLCanvasElement>;
    onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
}

export const Canvas = ({
    canvasRef,
    previewRef,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave
}: CanvasProps) => {
    const [isDrawing, setIsDrawing] = useState(false);

    const onMouseEnter = () => {
        setIsDrawing(true);
    }


    useEffect(() => {
        const updateCanvasSize = () => {
            const canvas = canvasRef.current;
            const previewCanvas = previewRef.current;
            const container = canvas?.parentElement;

            if (!canvas || !previewCanvas || !container) return;

            const rect = container.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            previewCanvas.width = rect.width * dpr;
            previewCanvas.height = rect.height * dpr;

            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
            previewCanvas.style.width = `${rect.width}px`;
            previewCanvas.style.height = `${rect.height}px`;

            const ctx = canvas.getContext('2d');
            const previewCtx = previewCanvas.getContext('2d');

            if (ctx) {
                ctx.scale(dpr, dpr);
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }

            if (previewCtx) {
                previewCtx.scale(dpr, dpr);
            }
        };

        updateCanvasSize();

        window.addEventListener('resize', updateCanvasSize);

        return () => {
            window.removeEventListener('resize', updateCanvasSize);
        };
    }, [canvasRef, previewRef]);

    return (
        <div className="relative w-full h-full">
            <canvas
                ref={canvasRef}
                className={`absolute top-0 left-0 w-full h-full touch-none ${isDrawing ? 'cursor-[url(../assets/pencil.svg), crosshair]' : 'cursor-default'}`}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
                onMouseEnter={onMouseEnter}
            />
            <canvas
                ref={previewRef}
                className="absolute top-0 left-0 w-full h-full touch-none pointer-events-none"
            />
        </div>
    );
};
