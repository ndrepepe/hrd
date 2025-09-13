"use client";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner"; // Mengubah import dari react-hot-toast menjadi sonner
import { SessionContextProvider } from "@/components/SessionContextProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import NavigationBar from "@/components/NavigationBar";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import CarRentalPage from "@/pages/CarRentalPage";
import DailyReportPage from "@/pages/DailyReportPage";
import EmployeePage from "@/pages/EmployeePage";

function App() {
  return (
    <BrowserRouter>
      <SessionContextProvider>
        <NavigationBar />
        <main className="pt-16">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute component={Index} />} />
            <Route path="/car-rental" element={<ProtectedRoute component={CarRentalPage} />} />
            <Route path="/daily-report" element={<ProtectedRoute component={DailyReportPage} />} />
            <Route path="/employees" element={<ProtectedRoute component={EmployeePage} />} />
          </Routes>
        </main>
        <Toaster /> {/* Menggunakan Toaster dari sonner */}
      </SessionContextProvider>
    </BrowserRouter>
  );
}

export default App;