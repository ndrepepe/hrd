import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Removed import for ProtectedRoute as it's no longer used for main routes

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CarRentalPage from "./pages/CarRentalPage";
import RecruitmentPage from "./pages/RecruitmentPage";
import DailyReportPage from "./pages/DailyReportPage";
import EmployeePage from "./pages/EmployeePage";
import Login from "./pages/Login"; // Keep Login page route as public
import NavigationBar from "./components/NavigationBar";
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* NavigationBar should ideally be inside a protected route or handle auth state internally */}
        {/* For now, keeping it outside Routes means it shows on Login page too */}
        <NavigationBar />
        <Routes>
          {/* Login page remains a public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes using ProtectedRoute component */}
          {/* The 'component' prop receives the component to render if authenticated */}
          <Route path="/" element={<ProtectedRoute component={Index} />} />
          <Route path="/car-rental" element={<ProtectedRoute component={CarRentalPage} />} />
          <Route path="/recruitment" element={<ProtectedRoute component={RecruitmentPage} />} />
          <Route path="/daily-report" element={<ProtectedRoute component={DailyReportPage} />} />
          <Route path="/employees" element={<ProtectedRoute component={EmployeePage} />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}

          {/* Catch-all route for 404 - remains public */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;