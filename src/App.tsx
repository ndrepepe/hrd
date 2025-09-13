"use client";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { SessionContextProvider } from "@/components/SessionContextProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import NavigationBar from "@/components/NavigationBar";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import CarRental from "@/pages/CarRental";
import DailyReport from "@/pages/DailyReport";
import Employees from "@/pages/Employees";

function App() {
  return (
    <BrowserRouter>
      <SessionContextProvider>
        <NavigationBar />
        <main className="pt-16"> {/* Add padding top to prevent content from being hidden by fixed navbar */}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute component={Index} />} />
            <Route path="/car-rental" element={<ProtectedRoute component={CarRental} />} />
            <Route path="/daily-report" element={<ProtectedRoute component={DailyReport} />} />
            <Route path="/employees" element={<ProtectedRoute component={Employees} />} />
          </Routes>
        </main>
        <Toaster />
      </SessionContextProvider>
    </BrowserRouter>
  );
}

export default App;