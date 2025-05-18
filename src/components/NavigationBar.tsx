"use client";

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePermissions } from '@/hooks/usePermissions'; // Import the hook
import { AppResources, getResourceString } from '@/utils/permissions'; // Import resources

const NavigationBar = () => {
  const { canAccessModule, isLoading } = usePermissions(); // Use the hook

  // Define module paths from AppResources
  const carRentalPath = AppResources.modules.carRental;
  const recruitmentPath = AppResources.modules.recruitment;
  const dailyReportPath = AppResources.modules.dailyReport;
  const employeesPath = AppResources.modules.employees;
  const permissionsPath = AppResources.modules.permissions; // Path for the new module

  // Check permissions for each module link
  const canAccessCarRental = canAccessModule(carRentalPath);
  const canAccessRecruitment = canAccessModule(recruitmentPath);
  const canAccessDailyReport = canAccessModule(dailyReportPath);
  const canAccessEmployees = canAccessModule(employeesPath);
  const canAccessPermissions = canAccessModule(permissionsPath); // Check permission for the permissions module

  // If permissions are still loading, maybe show a minimal nav or nothing
  if (isLoading) {
      return (
          <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-800 text-white p-4 shadow-md w-full">
              <div className="container mx-auto flex flex-wrap items-center justify-between">
                  <span className="text-xl font-bold mr-4">HRD ANDI OFFSET</span>
                  {/* Optionally show a loading indicator */}
                  <span className="text-sm text-gray-400">Memuat navigasi...</span>
              </div>
          </nav>
      );
  }


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-800 text-white p-4 shadow-md w-full">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <Link to="/" className="text-xl font-bold mr-4">
          HRD ANDI OFFSET
        </Link>
        <div className="flex flex-wrap space-x-4">
          {/* Conditionally render links based on permissions */}
          {canAccessCarRental && (
            <Link to={carRentalPath}>
              <Button variant="ghost" className="text-white hover:bg-gray-700">Peminjaman Mobil</Button>
            </Link>
          )}
          {canAccessRecruitment && (
            <Link to={recruitmentPath}>
              <Button variant="ghost" className="text-white hover:bg-gray-700">Rekrutmen Karyawan</Button>
            </Link>
          )}
          {canAccessDailyReport && (
            <Link to={dailyReportPath}>
              <Button variant="ghost" className="text-white hover:bg-gray-700">Laporan Harian</Button>
            </Link>
          )}
          {canAccessEmployees && (
            <Link to={employeesPath}>
              <Button variant="ghost" className="text-white hover:bg-gray-700">Data Karyawan</Button>
            </Link>
          )}
          {/* New link for Permissions Module, only visible if user has access */}
          {canAccessPermissions && (
            <Link to={permissionsPath}>
              <Button variant="ghost" className="text-white hover:bg-gray-700">Hak Akses</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;