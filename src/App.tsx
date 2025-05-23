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
import EditCandidatePage from "./pages/EditCandidatePage"; // Import the new edit page

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
          {/* All main application pages are now public */}
          <Route path="/" element={<Index />} />
          <Route path="/car-rental" element={<CarRentalPage />} />
          <Route path="/recruitment" element={<RecruitmentPage />} />
          <Route path="/daily-report" element={<DailyReportPage />} />
          <Route path="/employees" element={<EmployeePage />} />

          {/* Login page remains a public route */}
          <Route path="/login" element={<Login />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          {/* New route for editing a candidate */}
          <Route path="/recruitment/candidates/edit/:candidateId" element={<EditCandidatePage />} />


          {/* Catch-all route for 404 - remains public */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;