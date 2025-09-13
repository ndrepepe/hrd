"use client";

import { useState } from "react";
import EmployeeForm from "@/components/EmployeeForm"; // Correct import
import EmployeeList from "@/components/EmployeeList"; // Correct import

const Employees = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);

  const handleEmployeeSubmitted = () => {
    setRefreshTrigger((prev) => prev + 1);
    setEditingEmployeeId(null); // Clear editing state after submission
  };

  const handleEditClick = (employeeId: string) => {
    setEditingEmployeeId(employeeId);
  };

  const handleCancelEdit = () => {
    setEditingEmployeeId(null); // Clear editing state
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Manajemen Data Karyawan</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <EmployeeForm
          onEmployeeSubmitted={handleEmployeeSubmitted}
          editingEmployeeId={editingEmployeeId}
          setEditingEmployeeId={setEditingEmployeeId}
          onCancelEdit={handleCancelEdit}
        />
        <EmployeeList
          refreshTrigger={refreshTrigger}
          onEditClick={handleEditClick}
        />
      </div>
    </div>
  );
};

export default Employees;