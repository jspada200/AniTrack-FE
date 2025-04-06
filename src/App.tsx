import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";

function App() {
  return (
    <Theme appearance="dark" accentColor="violet">
      <RouterProvider router={router} />
    </Theme>
  );
}

export default App;
