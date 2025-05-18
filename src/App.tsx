import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import React from 'react'; // Import React for Fragment

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CarRentalPage from "./pages/CarRentalPage";
import RecruitmentPage from "./pages/RecruitmentPage";
import DailyReportPage from "./pages/DailyReportPage";
import EmployeePage from "./pages/EmployeePage";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute
import NavigationBar from "./components/NavigationBar";

const queryClient = new QueryClient();

const App = () => (
  // Wrap everything in a Fragment to ensure App returns a single element
  <React.Fragment>
    {/* QueryClientProvider wraps the main application structure */}
    <QueryClientProvider client={queryClient}>
      {/* TooltipProvider wraps the router */}
      <TooltipProvider>
        <BrowserRouter>
          {/* BrowserRouter can have multiple children like NavigationBar and Routes */}
          <NavigationBar />
          <Routes>
            {/* Public route for Login */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes using the new pattern */}
            {/* Pass the component to render via the 'component' prop */}
            <Route path="/" element={<ProtectedRoute component={Index} />} />
            <Route path="/car-rental" element={<ProtectedRoute component={CarRentalPage} />} />
            <Route path="/recruitment" element={<ProtectedRoute component={RecruitmentPage} />} />
            <Route path="/daily-report" element={<ProtectedRoute component={DailyReportPage} />} />
            <Route path="/employees" element={<ProtectedRoute component={EmployeePage} />} />

            {/* ADD ALL CUSTOM PROTECTED ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}

            {/* Catch-all route for 404 - also protected */}
            <Route path="*" element={<ProtectedRoute component={NotFound} />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    {/* Global Toasters - placed as siblings to the main provider chain */}
    <Toaster />
    <Sonner />
  </React.Fragment>
);

export default App;