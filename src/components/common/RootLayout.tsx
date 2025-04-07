import { Outlet } from "@tanstack/react-router";
import { Navigation } from "./Navigation";

export const RootLayout = () => {
  return (
    <>
      <Navigation />
      <Outlet />
    </>
  );
};
