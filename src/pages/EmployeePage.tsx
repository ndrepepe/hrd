"use client";

import React, { useState } from 'react';
import AddEmployeeForm from '@/components/AddEmployeeForm';
import EmployeeList from '@/components/EmployeeList';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users } from "lucide-react";

const EmployeePage = () => {
  const [refreshEmployees, setRefreshEmployees] = useState(0);
  const [activeTab, setActiveTab] = useState("add-employee"); // Default active tab
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null); // State to hold the ID of the employee being edited

  // Callback to trigger list refresh
  const handleEmployeeAdded = () => {
    setRefreshEmployees(prev => prev + 1);
    // Optionally switch to list view after adding
    // setActiveTab("list-employees");
  };

  const handleEditClick = (employeeId: string) => {
    setEditingEmployeeId(employeeId); // Set the ID of the employee to be edited
    setActiveTab("add-employee"); // Switch to the input form tab
  };

  const handleCancelEdit = () => {
    setEditingEmployeeId(null); // Clear the editing state
    setActiveTab("add-employee"); // Stay on the input tab, but clear the form
  };

  return (
    <div className="app-shell">
      <div className="app-container">
        <div className="page-header">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-amber-50 text-amber-700">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <p className="page-kicker">Database SDM</p>
              <h1 className="page-title">Modul Data Karyawan</h1>
            </div>
          </div>
          <p className="page-description">
            Kelola data lengkap karyawan di sini.
          </p>
        </div>

      {/* Tabs component wraps the TabsList and TabsContent */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* TabsList (Horizontal Tabs) */}
        {/* Use grid for responsive horizontal layout */}
        <TabsList className="mb-6 grid h-auto w-full grid-cols-2 gap-2"> {/* Use 2 columns on all screen sizes */}
          <TabsTrigger value="add-employee">Tambah Karyawan</TabsTrigger>
          <TabsTrigger value="list-employees">Daftar Karyawan</TabsTrigger>
        </TabsList>

        {/* TabsContent area - Removed the extra div wrapper */}
        <TabsContent value="add-employee" className="mt-0">
          <AddEmployeeForm onEmployeeAdded={handleEmployeeAdded} />
        </TabsContent>

        <TabsContent value="list-employees" className="mt-0">
          <EmployeeList
            refreshTrigger={refreshEmployees}
            onEditClick={handleEditClick} // Pass the handleEditClick function
          />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
  };

export default EmployeePage;
