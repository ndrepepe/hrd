"use client";

import React, { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions'; // Import the hook
import { AppResources, getResourceString } from '@/utils/permissions'; // Import resources
import { supabase } from '@/integrations/supabase/client'; // Import supabase
import { showError, showSuccess } from '@/utils/toast'; // Import toasts

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react"; // Import Loader icon

interface Employee {
  id: string;
  name: string;
  user_id: string | null; // Need user_id to know if they can log in
}

interface EmployeePermission {
  id?: string; // Optional for new permissions
  employee_id: string;
  resource: string;
  allowed: boolean;
}

// Define all possible resources dynamically from AppResources
const allResources = [
  ...Object.values(AppResources.modules).map(path => ({
    id: getResourceString('module', path),
    label: `Modul: ${path.replace('/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Home'}`, // Generate a readable label
    type: 'module',
    path: path,
  })),
  ...Object.entries(AppResources.tabs).flatMap(([moduleKey, tabs]) =>
    Object.entries(tabs).map(([tabKey, tabValue]) => ({
      id: getResourceString('tab', AppResources.modules[moduleKey as keyof typeof AppResources.modules], tabValue),
      label: `Sub-modul: ${moduleKey.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${tabKey.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
      type: 'tab',
      modulePath: AppResources.modules[moduleKey as keyof typeof AppResources.modules],
      tabValue: tabValue,
    }))
  ),
   ...Object.entries(AppResources.actions).flatMap(([moduleKey, tabs]) =>
    Object.entries(tabs).flatMap(([tabValue, actions]) =>
      Object.entries(actions).map(([actionKey, actionValue]) => ({
        id: getResourceString('action', AppResources.modules[moduleKey as keyof typeof AppResources.modules], tabValue, actionValue),
        label: `Aksi: ${moduleKey.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${tabValue.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${actionKey.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
        type: 'action',
        modulePath: AppResources.modules[moduleKey as keyof typeof AppResources.modules],
        tabValue: tabValue,
        actionType: actionValue,
      }))
    )
  ),
].sort((a, b) => a.label.localeCompare(b.label)); // Sort resources alphabetically by label


const PermissionsPage = () => {
  const { canAccessModule, isLoading: isLoadingPermissionsHook } = usePermissions(); // Check if user can access THIS module
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [employeePermissions, setEmployeePermissions] = useState<EmployeePermission[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check if the current user has permission to view this page
  const hasViewPermission = canAccessModule(AppResources.modules.permissions);

  useEffect(() => {
    if (!isLoadingPermissionsHook && hasViewPermission) {
      fetchEmployees();
    }
  }, [isLoadingPermissionsHook, hasViewPermission]); // Fetch employees once permissions hook is ready and user has access

  useEffect(() => {
    if (selectedEmployeeId) {
      fetchEmployeePermissions(selectedEmployeeId);
    } else {
      setEmployeePermissions([]); // Clear permissions if no employee is selected
    }
  }, [selectedEmployeeId]);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    // Fetch employees who have a linked user_id, as only they can log in and need permissions
    const { data, error } = await supabase
      .from("employees")
      .select("id, name, user_id")
      .not('user_id', 'is', null) // Only fetch employees linked to a user account
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching employees for permissions:", error);
      showError("Gagal memuat daftar karyawan: " + error.message);
      setEmployees([]);
    } else {
      console.log("Fetched employees for permissions:", data);
      setEmployees(data || []);
    }
    setLoadingEmployees(false);
  };

  const fetchEmployeePermissions = async (employeeId: string) => {
    setLoadingPermissions(true);
    console.log("Fetching permissions for employee:", employeeId);
    const { data, error } = await supabase
      .from("employee_permissions")
      .select("id, resource, allowed")
      .eq("employee_id", employeeId);

    if (error) {
      console.error("Error fetching employee permissions:", error);
      showError("Gagal memuat hak akses karyawan: " + error.message);
      setEmployeePermissions([]);
    } else {
      console.log("Fetched employee permissions:", data);
      setEmployeePermissions(data || []);
    }
    setLoadingPermissions(false);
  };

  const handlePermissionChange = (resourceId: string, isAllowed: boolean) => {
    setEmployeePermissions(prevPermissions => {
      const existingPermissionIndex = prevPermissions.findIndex(p => p.resource === resourceId);

      if (existingPermissionIndex > -1) {
        // Update existing permission
        const updatedPermissions = [...prevPermissions];
        updatedPermissions[existingPermissionIndex] = {
          ...updatedPermissions[existingPermissionIndex],
          allowed: isAllowed,
        };
        return updatedPermissions;
      } else {
        // Add new permission (default is allowed=true, so only need to add if setting to false initially,
        // or if we want to explicitly store all permissions. Let's explicitly store if changed from default TRUE).
        // Or, simpler: just add/update the state and handle insert/upsert on save.
         if (selectedEmployeeId) {
            return [
              ...prevPermissions,
              { employee_id: selectedEmployeeId, resource: resourceId, allowed: isAllowed },
            ];
         }
         return prevPermissions; // Should not happen if employee is selected
      }
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedEmployeeId) return;
    setIsSaving(true);

    console.log("Saving permissions for employee:", selectedEmployeeId, employeePermissions);

    // Prepare data for upsert (insert or update)
    const permissionsToSave = employeePermissions.map(p => ({
      id: p.id, // Include ID for updates
      employee_id: selectedEmployeeId,
      resource: p.resource,
      allowed: p.allowed,
    }));

    // Use upsert to handle both new and existing permissions efficiently
    const { data, error } = await supabase
      .from('employee_permissions')
      .upsert(permissionsToSave, { onConflict: 'employee_id, resource' }) // Conflict target
      .select(); // Select the saved data

    setIsSaving(false);

    if (error) {
      console.error("Error saving permissions:", error);
      showError("Gagal menyimpan hak akses: " + error.message);
    } else {
      console.log("Permissions saved successfully:", data);
      showSuccess("Hak akses berhasil diperbarui!");
      // Re-fetch permissions to ensure state is in sync with DB, including new IDs
      fetchEmployeePermissions(selectedEmployeeId);
      // Trigger refresh in the permissions hook for the current user if their permissions were changed
      // This requires knowing if the selected employee is the current user, which is complex here.
      // A simpler approach for now is to ask the user to refresh the page, or trigger a global permissions refresh.
      // Let's add a refresh function to the hook and call it here.
      // refreshPermissions(); // This would refresh permissions for the *current* user, not necessarily the one being edited.
      // A better approach is to have the hook listen to DB changes or have a global refresh mechanism.
      // For now, the user might need to refresh their page to see permission changes take effect.
      // Let's add a note about this.
    }
  };

  if (isLoadingPermissionsHook) {
      return <div className="container mx-auto p-4 pt-16">Memuat hak akses...</div>;
  }

  if (!hasViewPermission) {
      return (
          <div className="container mx-auto p-4 pt-16 text-center">
              <h1 className="text-2xl font-bold mb-4">Akses Ditolak</h1>
              <p className="text-gray-600">Anda tidak memiliki izin untuk mengakses modul ini.</p>
          </div>
      );
  }


  return (
    <div className="container mx-auto p-4 pt-16">
      <h1 className="text-3xl font-bold mb-2 text-center">Modul Hak Akses</h1>
      <p className="text-center text-gray-600 mb-8">
        Atur hak akses untuk setiap karyawan yang terhubung dengan akun pengguna.
      </p>

      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Employee Selection */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <Label htmlFor="employee-select" className="shrink-0">Pilih Karyawan:</Label>
          <Select value={selectedEmployeeId || ""} onValueChange={setSelectedEmployeeId}>
            <SelectTrigger id="employee-select" className="w-full md:w-[300px]">
              <SelectValue placeholder="Pilih karyawan" />
            </SelectTrigger>
            <SelectContent>
              {loadingEmployees ? (
                <SelectItem disabled value="">Memuat karyawan...</SelectItem>
              ) : employees.length === 0 ? (
                 <SelectItem disabled value="">Tidak ada karyawan dengan akun terhubung</SelectItem>
              ) : (
                employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name} ({employee.employee_id})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Permissions Table */}
        {selectedEmployeeId && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Hak Akses untuk {employees.find(emp => emp.id === selectedEmployeeId)?.name || 'Karyawan Terpilih'}</h3>
            {loadingPermissions ? (
              <p>Memuat hak akses...</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sumber Daya (Modul/Sub-modul/Aksi)</TableHead>
                      <TableHead className="text-center">Diizinkan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allResources.map(resource => {
                      // Find the current permission setting for this resource for the selected employee
                      const currentPermission = employeePermissions.find(p => p.resource === resource.id);
                      // Default is true if no specific permission is set
                      const isAllowed = currentPermission ? currentPermission.allowed : true;

                      return (
                        <TableRow key={resource.id}>
                          <TableCell>{resource.label}</TableCell>
                          <TableCell className="text-center">
                            <Checkbox
                              checked={isAllowed}
                              onCheckedChange={(checked) => handlePermissionChange(resource.id, checked === true)}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            <Button onClick={handleSavePermissions} disabled={loadingPermissions || isSaving}>
               {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               Simpan Hak Akses
            </Button>
             <p className="text-sm text-gray-600 mt-2">Catatan: Perubahan hak akses mungkin memerlukan karyawan untuk me-refresh halaman mereka agar berlaku.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionsPage;