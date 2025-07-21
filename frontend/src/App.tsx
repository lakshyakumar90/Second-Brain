import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import GuestGuard from "./guards/GuestGuard";
import RegistrationGuard from "./guards/RegistrationGuard";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import AuthInitializer from "./components/AuthInitializer";
import { DarkModeProvider } from './contexts/DarkModeContext';

function App() {
  return (
    <AuthInitializer>
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
        {/* Wrap all other routes in DarkModeProvider */}
        <Route
          path="/*"
          element={
            <DarkModeProvider>
              <Routes>
                <Route
                  path="auth/*"
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
                  <Route path="forgot-password" element={<ForgotPassword />} />
                </Route>
                <Route
                  path="dashboard/*"
                  element={
                    <RegistrationGuard>
                      <DashboardLayout>
                        <Outlet />
                      </DashboardLayout>
                    </RegistrationGuard>
                  }
                >
                  <Route index element={<Dashboard />} />
                </Route>
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </DarkModeProvider>
          }
        />
      </Routes>
    </BrowserRouter>
    </AuthInitializer>
  );
}

export default App;
