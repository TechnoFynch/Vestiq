import { useAppSelector } from "@/hooks/redux";
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";

const ProtectedRouteGuard = () => {
  const token = useAppSelector((state) => state.auth.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRouteGuard;
