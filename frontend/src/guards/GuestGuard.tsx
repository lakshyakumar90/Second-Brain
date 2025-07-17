import { Navigate } from "react-router-dom";

const GuestGuard = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = false;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return <div className="min-h-screen bg-black text-white">{children}</div>;
};

export default GuestGuard;
