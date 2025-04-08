import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { LandingPage } from "./pages/LandingPage";
import FeedPage from "./pages/feed/feed";
import { RootLayout } from "./components/common/RootLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { useEffect } from "react";
import { supabase } from "./lib/supabase";
import { useNavigate } from "@tanstack/react-router";

// Create a root route
const rootRoute = createRootRoute({
  component: RootLayout,
});

// Create an index route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <LandingPage />,
});

// Create auth routes
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => <LoginPage />,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: () => <SignupPage />,
});

// Auth Callback Component
function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          navigate({ to: "/login" });
          return;
        }

        if (session) {
          const redirectPath = localStorage.getItem("redirectAfterLogin");
          if (redirectPath) {
            localStorage.removeItem("redirectAfterLogin");
            navigate({ to: redirectPath });
          } else {
            navigate({ to: "/feed" });
          }
        }
      } catch (error) {
        console.error("Error in auth callback:", error);
        navigate({ to: "/login" });
      }
    };

    handleCallback();
  }, [navigate]);

  return <div>Loading...</div>;
}

// Create auth callback route
const authCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/callback",
  component: AuthCallback,
});

// Protected Feed Component
function ProtectedFeed() {
  return <FeedPage />;
}

// Create a protected feed route
const feedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/feed",
  component: ProtectedFeed,
});

// Create the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  signupRoute,
  authCallbackRoute,
  feedRoute,
]);

// Create the router
export const router = createRouter({ routeTree });

// Register the router for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
