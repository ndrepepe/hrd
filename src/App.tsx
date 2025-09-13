import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute"; // Re-import ProtectedRoute
import { SessionContextProvider } from "./components/SessionContextProvider"; // Import SessionContextProvider

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CarRentalPage from "./pages/CarRentalPage";
import RecruitmentPage from "./pages/RecruitmentPage";
import DailyReportPage from "./pages/DailyReportPage";
import EmployeePage from "./pages/EmployeePage";
import Login from "./pages/Login";
import NavigationBar from "./components/NavigationBar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionContextProvider> {/* Wrap with SessionContextProvider */}
          <NavigationBar />
          <Routes>
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute component={Index} />} />
            <Route path="/car-rental" element={<ProtectedRoute component={CarRentalPage} />} />
            <Route path="/recruitment" element={<ProtectedRoute component={RecruitmentPage} />} />
            <Route path="/daily-report" element={<ProtectedRoute component={DailyReportPage} />} />
            <Route path="/employees" element={<ProtectedRoute component={EmployeePage} />} />

            {/* Public Route for Login */}
            <Route path="/login" element={<Login />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}

            {/* Catch-all route for 404 - remains public */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;