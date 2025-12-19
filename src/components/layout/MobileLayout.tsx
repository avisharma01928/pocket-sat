
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, GitMerge, BrainCircuit, History, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
    children: React.ReactNode;
}

const MobileLayout = ({ children }: MobileLayoutProps) => {
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: GitMerge, label: "Path", path: "/path" },
        { icon: BrainCircuit, label: "Practice", path: "/practice" },
        { icon: History, label: "Review", path: "/review" },
        { icon: User, label: "Profile", path: "/profile" },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <div className="flex-1 pb-20 overflow-y-auto no-scrollbar">
                {children}
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 pb-safe">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
                                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Icon className={cn("w-6 h-6", isActive && "animate-pulse")} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MobileLayout;
