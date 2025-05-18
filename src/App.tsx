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
import { PermissionsProvider } from "./hooks/usePermissions"; // Import PermissionsProvider
import PermissionsPage from "./pages/PermissionsPage"; // Import the new PermissionsPage

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Wrap the main content (including NavigationBar and Routes) with PermissionsProvider */}
        <PermissionsProvider>
          {/* NavigationBar needs access to permissions to show/hide links */}
          <NavigationBar />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} /> {/* 404 page */}

            {/* Protected routes (will use usePermissions internally) */}
            {/* We don't need a top-level ProtectedRoute wrapper anymore,
                each page/component will check permissions */}
            <Route path="/car-rental" element={<CarRentalPage />} />
            <Route path="/recruitment" element={<RecruitmentPage />} />
            <Route path="/daily-report" element={<DailyReportPage />} />
            <Route path="/employees" element={<EmployeePage />} />
            {/* New route for Permissions Management */}
            <Route path="/permissions" element={<PermissionsPage />} />


            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}

          </Routes>
        </PermissionsProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;