import { createBrowserRouter } from "react-router";
import App from "@/App";
import RootLayout from "@/components/layout/RootLayout";

export default createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      {
        path: "/",
        Component: App,
      },
    ],
  },
]);
