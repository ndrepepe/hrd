"use client";

import React, { useState } from 'react';
import AddEmployeeForm from '@/components/AddEmployeeForm';
import EmployeeList from '@/components/EmployeeList';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <div className="container mx-auto p-4 pt-16"> {/* Main page container, pt-16 for main nav */}
      <h1 className="text-3xl font-bold mb-2 text-center">Modul Data Karyawan</h1>
      <p className="text-center text-gray-600 mb-8">
        Kelola data lengkap karyawan di sini.
      </p>

      {/* Tabs component wraps the TabsList and TabsContent */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* TabsList (Horizontal Tabs) */}
        {/* Use grid for responsive horizontal layout */}
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 mb-6"> {/* Adjusted grid-cols for responsiveness */}
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
  );
  };

export default EmployeePage;