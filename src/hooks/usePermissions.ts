"use client";

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { getResourceString, AppResources } from '@/utils/permissions'; // Import resource definitions

interface Permission {
  resource: string;
  allowed: boolean;
}

interface PermissionsContextType {
  permissions: Permission[];
  isLoading: boolean;
  canAccessModule: (path: string) => boolean;
  canAccessTab: (modulePath: string, tabValue: string) => boolean;
  canPerformAction: (modulePath: string, tabValue: string, actionType: string) => boolean;
  // Add a way to trigger refresh if needed, e.g., after permission changes
  refreshPermissions: () => void;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider = ({ children }: { children: ReactNode }) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // State to manually trigger refresh

  const refreshPermissions = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchUserAndPermissions = async () => {
      setIsLoading(true);
      setPermissions([]); // Clear previous permissions

      // 1. Get the current Supabase user session
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user:", userError);
        showError("Gagal memuat data pengguna: " + userError.message);
        setIsLoading(false);
        return;
      }

      if (!user) {
        console.log("No user logged in. Permissions are empty.");
        setIsLoading(false);
        return;
      }

      console.log("Logged in user ID:", user.id);

      // 2. Find the employee linked to this user ID
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (employeeError && employeeError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error("Error fetching linked employee:", employeeError);
        showError("Gagal memuat data karyawan terkait: " + employeeError.message);
        setIsLoading(false);
        return;
      }

      if (!employeeData) {
        console.log("No employee linked to this user ID. Permissions are empty.");
        setIsLoading(false);
        return;
      }

      const employeeId = employeeData.id;
      console.log("Linked employee ID:", employeeId);

      // 3. Fetch permissions for this employee ID
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('employee_permissions')
        .select('resource, allowed')
        .eq('employee_id', employeeId);

      if (permissionsError) {
        console.error("Error fetching employee permissions:", permissionsError);
        showError("Gagal memuat hak akses: " + permissionsError.message);
        setPermissions([]); // Ensure permissions are empty on error
      } else {
        console.log("Fetched permissions:", permissionsData);
        // Store permissions in a way that's easy to look up
        // For now, just store the array. Lookup will iterate.
        setPermissions(permissionsData || []);
      }

      setIsLoading(false);
    };

    fetchUserAndPermissions();

    // Listen for auth state changes to re-fetch permissions
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log("Auth state changed, re-fetching permissions.");
        fetchUserAndPermissions(); // Re-fetch permissions on login/logout
    });

    return () => {
        console.log("Unsubscribing from auth state changes");
        subscription.unsubscribe();
    };

  }, [refreshTrigger]); // Re-run effect when refreshTrigger changes

  // Helper function to check if a resource is allowed
  const isResourceAllowed = (resourceString: string): boolean => {
    // If no specific permission is found for a resource, should it be allowed or denied by default?
    // A secure default is DENY. So, if a permission is NOT in the fetched list or explicitly set to false, deny it.
    const permission = permissions.find(p => p.resource === resourceString);
    // If permission exists and is allowed, return true. Otherwise, return false.
    return permission?.allowed === true;
  };

  const canAccessModule = (path: string): boolean => {
    const resource = getResourceString('module', path);
    // If the user is not logged in, deny access to all modules except public ones (like login, index, 404)
    // We need to handle public routes outside this hook or pass a flag.
    // For now, assume this hook is used within protected areas or after auth check.
    // Let's add a basic check: if user is loading or no permissions fetched, deny.
    if (isLoading) return false; // Or show a loading state
    if (permissions.length === 0) {
        // If no permissions are explicitly assigned, what's the default?
        // Let's allow access to the Index page and Login page by default, regardless of permissions.
        // Other modules require explicit permission.
        if (path === '/' || path === '/login' || path === '/404') return true;
        // For any other module, if no permissions are fetched, deny.
        if (!permissions || permissions.length === 0) return false;
    }

    // Check if the specific module resource is allowed
    return isResourceAllowed(resource);
  };

  const canAccessTab = (modulePath: string, tabValue: string): boolean => {
     // If module access is denied, deny tab access too
     if (!canAccessModule(modulePath)) return false;

     const resource = getResourceString('tab', modulePath, tabValue);
     // If no specific tab permission is found, inherit from module permission?
     // Or require explicit tab permission? Let's require explicit tab permission for simplicity.
     // If no permission is found for the specific tab, deny.
     return isResourceAllowed(resource);
  };

  const canPerformAction = (modulePath: string, tabValue: string, actionType: string): boolean => {
     // If tab access is denied, deny action access too
     if (!canAccessTab(modulePath, tabValue)) return false;

     const resource = getResourceString('action', modulePath, tabValue, actionType);
     // If no specific action permission is found, inherit from tab permission?
     // Or require explicit action permission? Let's require explicit action permission.
     // If no permission is found for the specific action, deny.
     return isResourceAllowed(resource);
  };


  return (
    <PermissionsContext.Provider value={{
      permissions,
      isLoading,
      canAccessModule,
      canAccessTab,
      canPerformAction,
      refreshPermissions,
    }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};