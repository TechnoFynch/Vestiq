import { useAppSelector } from "@/hooks/redux";
import { Navigate, Outlet, useLocation } from "react-router";

const GuestRoute = () => {
  const token = useAppSelector((state) => state.auth.token);
  const location = useLocation();

  const from = (location.state as { from?: Location })?.from?.pathname || "/";

  if (token) {
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
