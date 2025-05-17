import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CarRentalPage from "./pages/CarRentalPage";
import RecruitmentPage from "./pages/RecruitmentPage";
import DailyReportPage from "./pages/DailyReportPage";
import EmployeePage from "./pages/EmployeePage"; // Import the new page
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import NavigationBar from "./components/NavigationBar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Render NavigationBar outside of Routes */}
        <NavigationBar />
        <Routes>
          {/* Public route for Login */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          {/* Wrap protected content with ProtectedRoute */}
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/car-rental" element={<ProtectedRoute><CarRentalPage /></ProtectedRoute>} />
          <Route path="/recruitment" element={<ProtectedRoute><RecruitmentPage /></ProtectedRoute>} />
          <Route path="/daily-report" element={<ProtectedRoute><DailyReportPage /></ProtectedRoute>} />
          {/* New protected route for Employee Data */}
          <Route path="/employees" element={<ProtectedRoute><EmployeePage /></ProtectedRoute>} />

          {/* ADD ALL CUSTOM PROTECTED ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}

          {/* Catch-all route for 404 - also protected */}
          <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;