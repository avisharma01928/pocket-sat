import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";

import Dashboard from "./pages/Dashboard";
import Placement from "./pages/Placement";
import Practice from "./pages/Practice";
import Results from "./pages/Results";


import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import MobileLayout from "./components/layout/MobileLayout";
import Path from "./pages/Path";
import Review from "./pages/Review";

const queryClient = new QueryClient();

import { AutoSync } from "./components/AutoSync";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AutoSync />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />


          {/* App Routes wrapped in MobileLayout */}
          <Route path="/dashboard" element={<MobileLayout><Dashboard /></MobileLayout>} />
          <Route path="/path" element={<MobileLayout><Path /></MobileLayout>} />
          <Route path="/practice" element={<MobileLayout><Practice /></MobileLayout>} />
          <Route path="/review" element={<MobileLayout><Review /></MobileLayout>} />
          <Route path="/profile" element={<MobileLayout><Profile /></MobileLayout>} />

          <Route path="/placement" element={<Placement />} />
          <Route path="/results" element={<Results />} />


          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
