import { Navigate } from "react-router-dom";

const GuestGuard = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = false;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

export default GuestGuard;
