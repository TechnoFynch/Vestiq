import { createBrowserRouter } from "react-router";
import RootLayout from "@/components/layout/RootLayout";
import AuthLayout from "@/components/layout/AuthLayout";
import Register from "@/pages/Register";
import Home from "@/pages/Home";
import GuestRouteGuard from "@/router/GuestRouteGuard";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

export default createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      {
        path: "/",
        Component: Home,
      },
    ],
  },
  {
    Component: GuestRouteGuard,
    children: [
      {
        Component: AuthLayout,
        children: [
          {
            path: "/register",
            Component: Register,
          },
          {
            path: "/login",
            Component: Login,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
