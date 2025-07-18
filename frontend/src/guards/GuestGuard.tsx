import { Navigate } from "react-router-dom";

const GuestGuard = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = true;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

export default GuestGuard;
