import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DesmosCalculatorProps {
  onClose: () => void;
}

declare global {
  interface Window {
    Desmos: any;
  }
}

const DesmosCalculator = ({ onClose }: DesmosCalculatorProps) => {
  const calculatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (calculatorRef.current && window.Desmos) {
      const calculator = window.Desmos.GraphingCalculator(calculatorRef.current, {
        expressions: true,
        settingsMenu: true,
        zoomButtons: true,
      });

      return () => {
        calculator.destroy();
      };
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl h-[600px] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Desmos Calculator</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div ref={calculatorRef} className="flex-1 w-full" />
      </div>
    </div>
  );
};

export default DesmosCalculator;
