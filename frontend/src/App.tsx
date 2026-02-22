import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Events from "./pages/Events";
import Courses from "./pages/Courses";
import Register from "./pages/Register";
import YesPlus from "./pages/YesPlus";
import Admin from "./pages/Admin";
import StudentDashboard from "./pages/StudentDashboard";
import FacilitatorDashboard from "./pages/FacilitatorDashboard";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/events" element={<Events />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/register" element={<Register />} />
            <Route path="/yesplus" element={<YesPlus />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/facilitator" element={<FacilitatorDashboard />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
