import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import { AuthProvider } from "./contexts/AuthContext";
import { ProjectProvider } from "./contexts/ProjectContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthError } from "./pages/AuthError";
import { Login } from "./pages/Login";

const queryClient = new QueryClient();

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProjectProvider>
          <Theme appearance="dark" accentColor="violet">
            <BrowserRouter>
              <Routes>
                <Route path="/auth/callback" element={<AuthError />} />
                <Route path="/login" element={<Login />} />
                <Route path="/*" element={<RouterProvider router={router} />} />
              </Routes>
            </BrowserRouter>
          </Theme>
        </ProjectProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
