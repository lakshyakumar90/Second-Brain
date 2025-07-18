import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import AuthGuard from "./guards/AuthGuard";
import GuestGuard from "./guards/GuestGuard";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <GuestGuard>
              <LandingPage />
            </GuestGuard>
          }
        />
        <Route
          path="/auth"
          element={
            <GuestGuard>
              <AuthLayout>
                <Outlet />
              </AuthLayout>
            </GuestGuard>
          }
        >
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <DashboardLayout>
                <Outlet />
              </DashboardLayout>
            </AuthGuard>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
