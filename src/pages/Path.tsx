
import { useState } from "react";
import { CURRICULUM_NODES, ModuleNode } from "@/lib/curriculum";
import { cn } from "@/lib/utils";
import { Check, Lock, Play, BookOpen, AlertCircle } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Path = () => {
  const [selectedNode, setSelectedNode] = useState<ModuleNode | null>(null);

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "mastered":
        return <Check className="w-4 h-4 text-black font-bold" />;
      case "locked":
        return <Lock className="w-4 h-4 text-muted-foreground" />;
      case "review":
        return <AlertCircle className="w-4 h-4 text-foreground" />;
      default:
        return null;
    }
  };

  const getNodeColor = (status: string) => {
    switch (status) {
      case "mastered":
        return "bg-primary border-primary";
      case "review":
        return "bg-warning border-warning";
      case "incomplete":
        return "bg-background border-foreground"; // Hollow
      case "locked":
        return "bg-muted border-muted";
      default:
        return "bg-muted border-muted";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 p-6 overflow-hidden">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Your Path</h1>
        <p className="text-muted-foreground text-sm">Follow the line to mastery.</p>
      </header>

      <div className="relative max-w-lg mx-auto">
        {/* Central Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-border -translate-x-1/2" />

        <div className="space-y-12 relative">
          {CURRICULUM_NODES.map((node) => (
            <div key={node.id} className="flex items-center w-full relative">

              {/* Left Side (Math) */}
              <div className={cn("w-1/2 pr-8 flex justify-end", node.position === "right" && "invisible")}>
                <div onClick={() => node.status !== "locked" && setSelectedNode(node)} className={cn("cursor-pointer transition-transform hover:scale-105 text-right", node.status === "locked" && "cursor-not-allowed opacity-50")}>
                  <h3 className="font-bold text-lg">{node.title}</h3>
                  <p className="text-xs text-muted-foreground">{node.description}</p>
                </div>
              </div>

              {/* Node Marker */}
              <div
                onClick={() => node.status !== "locked" && setSelectedNode(node)}
                className={cn(
                  "absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-4 z-10 flex items-center justify-center cursor-pointer transition-all hover:scale-110",
                  getNodeColor(node.status),
                  node.status === "locked" && "cursor-not-allowed"
                )}
              >
                <StatusIcon status={node.status} />
              </div>

              {/* Right Side (English) */}
              <div className={cn("w-1/2 pl-8", node.position === "left" && "invisible")}>
                <div onClick={() => node.status !== "locked" && setSelectedNode(node)} className={cn("cursor-pointer transition-transform hover:scale-105", node.status === "locked" && "cursor-not-allowed opacity-50")}>
                  <h3 className="font-bold text-lg">{node.title}</h3>
                  <p className="text-xs text-muted-foreground">{node.description}</p>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      <Drawer open={!!selectedNode} onOpenChange={(open) => !open && setSelectedNode(null)}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-md">
            <DrawerHeader>
              <DrawerTitle className="text-2xl font-bold flex items-center gap-2">
                {selectedNode?.subject === "math" ? <BookOpen className="w-6 h-6 text-primary" /> : <BookOpen className="w-6 h-6 text-accent" />}
                {selectedNode?.title}
              </DrawerTitle>
              <DrawerDescription>{selectedNode?.description}</DrawerDescription>
            </DrawerHeader>

            <div className="p-4 space-y-4">
              {selectedNode?.videoUrl && (
                <Button className="w-full" variant="outline" onClick={() => window.open(`https://youtube.com/watch?v=${selectedNode.videoUrl}`, '_blank')}>
                  <Play className="mr-2 w-4 h-4" /> Watch Tutorial
                </Button >
              )}

              <Separator />

              <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Key Concepts</h4>
              <div className="space-y-4">
                {selectedNode?.concepts.map((concept, i) => (
                  <Card key={i} className="bg-secondary/30 border-none">
                    <CardContent className="p-4">
                      <p>{concept}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div >

            <DrawerFooter>
              <Button onClick={() => { setSelectedNode(null); /* Navigate to practice */ }}>Start Practice Lesson</Button>
              <DrawerClose asChild>
                <Button variant="ghost">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </div >
        </DrawerContent >
      </Drawer >
    </div >
  );
};

export default Path;

