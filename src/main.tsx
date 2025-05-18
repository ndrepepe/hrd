import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { SessionContextProvider } from '@supabase/auth-ui-react'; // Import SessionContextProvider
import { supabase } from "./integrations/supabase/client"; // Import supabase client

createRoot(document.getElementById("root")!).render(
  // Wrap the App component with SessionContextProvider
  <SessionContextProvider supabaseClient={supabase}>
    <App />
  </SessionContextProvider>
);