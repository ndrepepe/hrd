// Define the structure of application resources that can have permissions
export const AppResources = {
  modules: {
    carRental: '/car-rental',
    recruitment: '/recruitment',
    dailyReport: '/daily-report',
    employees: '/employees',
    permissions: '/permissions', // The new permissions module itself
  },
  tabs: {
    // Car Rental Tabs (values match TabsTrigger 'value' prop)
    carRental: {
      addCar: 'add-car',
      listCars: 'list-cars',
      addRental: 'add-rental',
      listRentals: 'list-rentals',
    },
    // Recruitment Tabs (values match TabsTrigger 'value' prop)
    recruitment: {
      addPosition: 'add-position',
      listPositions: 'list-positions',
      addCandidate: 'add-candidate',
      listCandidates: 'list-candidates',
      addInterview: 'add-interview',
      listInterviews: 'list-interviews',
      addDecision: 'add-decision',
      listDecisions: 'list-decisions',
      briefingList: 'briefing-list',
    },
    // Daily Report Tabs (values match TabsTrigger 'value' prop)
    dailyReport: {
      inputReport: 'input-report',
      listReports: 'list-reports',
    },
    // Employee Tabs (values match TabsTrigger 'value' prop)
    employees: {
      addEmployee: 'add-employee',
      listEmployees: 'list-employees',
    },
    // Permissions Tabs (if any)
    permissions: {
      assignPermissions: 'assign-permissions', // Example tab value for the permissions page itself
    }
  },
  actions: {
    // Actions within lists/tables (values can be 'edit', 'delete', 'update', etc.)
    // Format: { modulePath: { tabValue: { actionType: 'action-name' } } }
    carRental: {
      'list-cars': {
        edit: 'edit',
        delete: 'delete',
      },
      'list-rentals': {
        edit: 'edit',
        delete: 'delete',
      },
    },
    recruitment: {
      'list-positions': {
        edit: 'edit',
        delete: 'delete',
      },
      'list-candidates': {
        // No edit/delete buttons currently, but define for future
        edit: 'edit',
        delete: 'delete',
      },
      'list-interviews': {
        // No edit/delete buttons currently, but define for future
        edit: 'edit',
        delete: 'delete',
      },
      'list-decisions': {
        // No edit/delete buttons currently, but define for future
        edit: 'edit',
        delete: 'delete',
      },
      'briefing-list': {
        edit: 'update', // 'Update' button in BriefingList
      }
    },
    dailyReport: {
      'list-reports': {
        // No edit/delete buttons currently
        edit: 'edit',
        delete: 'delete',
      }
    },
    employees: {
      'list-employees': {
        edit: 'edit',
        delete: 'delete',
      }
    }
  }
};

// Helper function to generate resource string identifiers
export const getResourceString = (type: 'module' | 'tab' | 'action', path: string, tab?: string, action?: string): string => {
  if (type === 'module') return `module:${path}`;
  if (type === 'tab' && tab) return `tab:${path}:${tab}`;
  if (type === 'action' && tab && action) return `action:${path}:${tab}:${action}`;
  // Fallback or throw error for invalid combinations
  console.error(`Invalid resource definition attempt: type=${type}, path=${path}, tab=${tab}, action=${action}`);
  return 'invalid-resource'; // Return a known invalid string
};

// Example usage:
// getResourceString('module', AppResources.modules.carRental) // "module:/car-rental"
// getResourceString('tab', AppResources.modules.recruitment, AppResources.tabs.recruitment.listCandidates) // "tab:/recruitment:list-candidates"
// getResourceString('action', AppResources.modules.recruitment, AppResources.tabs.recruitment.listPositions, AppResources.actions.recruitment.listPositions.delete) // "action:/recruitment:list-positions:delete"