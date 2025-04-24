
interface DrawingToolsProps {
  color: string;
  thickness: number;
  onColorChange: (color: string) => void;
  onThicknessChange: (thickness: number) => void;
  onClearCanvas: () => void;
}

const colors = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ff8000', '#8000ff'
];

const thicknesses = [1, 3, 5, 8, 12];


export const DrawingTools = ({
  color,
  thickness,
  onColorChange,
  onThicknessChange,
  onClearCanvas
}: DrawingToolsProps) => {

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-white/10 backdrop-blur-sm items-center justify-center">
      <div className="flex flex-row gap-4 items-center justify-center">
        <h3 className="text-white text-sm font-medium">Colors</h3>
        <div className="flex gap-2">
          {colors.map((c) => (
            <button
              key={c}
              className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${color === c ? 'border-teal-400 scale-110' : 'border-white/20 hover:border-white/40'
                }`}
              style={{ backgroundColor: c }}
              onClick={() => onColorChange(c)}
            />
          ))}
        </div>

        <h3 className="text-white text-sm font-medium">Thickness</h3>
        <div className="flex gap-2">
          {thicknesses.map((t) => (
            <button
              key={t}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${thickness === t ? 'bg-teal-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              onClick={() => onThicknessChange(t)}
            >
              <div
                className="bg-white rounded-full"
                style={{ width: t, height: t }}
              />
            </button>
          ))}
        </div>

        <button
          className=" bg-red-600 text-white p-2 rounded-lg font-medium hover:bg-red-800 transition-all duration-200"
          onClick={onClearCanvas}
        >
          Clear Canvas
        </button>
      </div>
    </div>
  );
};
