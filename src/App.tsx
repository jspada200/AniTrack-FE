import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Theme appearance="dark" accentColor="violet">
        <RouterProvider router={router} />
      </Theme>
    </AuthProvider>
  );
}

export default App;
