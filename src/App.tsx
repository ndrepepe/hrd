import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Removed import for supabase as it's not directly used here anymore
// Removed import for ProtectedRoute

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CarRentalPage from "./pages/CarRentalPage";
import RecruitmentPage from "./pages/RecruitmentPage";
import DailyReportPage from "./pages/DailyReportPage";
import EmployeePage from "./pages/EmployeePage";
import Login from "./pages/Login"; // Keep Login page route
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

          {/* Main application routes - now publicly accessible */}
          <Route path="/" element={<Index />} />
          <Route path="/car-rental" element={<CarRentalPage />} />
          <Route path="/recruitment" element={<RecruitmentPage />} />
          <Route path="/daily-report" element={<DailyReportPage />} />
          <Route path="/employees" element={<EmployeePage />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}

          {/* Catch-all route for 404 - now publicly accessible */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;