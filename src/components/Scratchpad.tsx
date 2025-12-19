
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Eraser, Trash2 } from "lucide-react";

interface ScratchpadProps {
    onClose: () => void;
}

const Scratchpad = ({ onClose }: ScratchpadProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState("#ffffff");
    const [lineWidth, setLineWidth] = useState(3);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const resize = () => {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        return () => window.removeEventListener("resize", resize);
    }, []);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        setIsDrawing(true);
        const { x, y } = getPos(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { x, y } = getPos(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();

        // @ts-ignore
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        // @ts-ignore
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        return {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    return (
        <div ref={containerRef} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-in fade-in cursor-crosshair">
            <canvas
                ref={canvasRef}
                className="w-full h-full touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />

            {/* Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
                <Button variant="destructive" size="icon" onClick={clearCanvas} title="Clear">
                    <Trash2 className="w-5 h-5" />
                </Button>
                <Button variant="secondary" size="icon" onClick={onClose} title="Close">
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-4 bg-card p-2 rounded-full border shadow-lg">
                <div
                    onClick={() => { setColor("#ffffff"); setLineWidth(3); }}
                    className={`w-8 h-8 rounded-full bg-white border-2 cursor-pointer ${color === "#ffffff" ? "border-primary scale-110" : "border-transparent"}`}
                />
                <div
                    onClick={() => { setColor("#ef4444"); setLineWidth(3); }}
                    className={`w-8 h-8 rounded-full bg-red-500 border-2 cursor-pointer ${color === "#ef4444" ? "border-primary scale-110" : "border-transparent"}`}
                />
                <div
                    onClick={() => { setColor("#3b82f6"); setLineWidth(3); }}
                    className={`w-8 h-8 rounded-full bg-blue-500 border-2 cursor-pointer ${color === "#3b82f6" ? "border-primary scale-110" : "border-transparent"}`}
                />
                <div
                    onClick={() => { setColor("#22c55e"); setLineWidth(3); }}
                    className={`w-8 h-8 rounded-full bg-green-500 border-2 cursor-pointer ${color === "#22c55e" ? "border-primary scale-110" : "border-transparent"}`}
                />
            </div>
        </div>
    );
};

export default Scratchpad;
