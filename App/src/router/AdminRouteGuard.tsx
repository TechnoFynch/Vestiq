import { useAppSelector } from "@/hooks/redux";
import React from "react";
import { Navigate, Outlet } from "react-router";

const AdminRouteGuard = () => {
  const token = useAppSelector((state) => state.auth.token);
  const role = useAppSelector((state) => state.auth.role);

  if (!token) {
    return <Navigate to="/login" replace />;
  } else if (role !== "admin") {
    return <Navigate to="/error" replace />;
  }

  return <Outlet />;
};

export default AdminRouteGuard;
