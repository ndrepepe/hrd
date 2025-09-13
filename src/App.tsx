"use client";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { SessionContextProvider } from "@/components/SessionContextProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import NavigationBar from "@/components/NavigationBar";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import CarRentalPage from "@/pages/CarRentalPage"; // Mengubah import dari CarRental menjadi CarRentalPage
import DailyReportPage from "@/pages/DailyReportPage"; // Mengubah import dari DailyReport menjadi DailyReportPage
import EmployeePage from "@/pages/EmployeePage"; // Mengubah import dari Employees menjadi EmployeePage

function App() {
  return (
    <BrowserRouter>
      <SessionContextProvider>
        <NavigationBar />
        <main className="pt-16"> {/* Add padding top to prevent content from being hidden by fixed navbar */}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute component={Index} />} />
            <Route path="/car-rental" element={<ProtectedRoute component={CarRentalPage} />} /> {/* Menggunakan CarRentalPage */}
            <Route path="/daily-report" element={<ProtectedRoute component={DailyReportPage} />} /> {/* Menggunakan DailyReportPage */}
            <Route path="/employees" element={<ProtectedRoute component={EmployeePage} />} /> {/* Menggunakan EmployeePage */}
          </Routes>
        </main>
        <Toaster />
      </SessionContextProvider>
    </BrowserRouter>
  );
}

export default App;