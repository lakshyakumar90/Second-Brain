import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import GuestGuard from "./guards/GuestGuard";
import RegistrationGuard from "./guards/RegistrationGuard";
import DashboardHome from "./pages/dashboard/DashboardHome";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import AuthInitializer from "./components/AuthInitializer";
import { DarkModeProvider } from './contexts/DarkModeContext';
import AIPage from "./pages/AIPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import TextEditor from "./pages/dashboard/TextEditor";

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
        <Route
          path="/ai"
          element={
            <GuestGuard>
              <AIPage />
            </GuestGuard>
          }
        />

        <Route
          path="/contact"
          element={
            <GuestGuard>
              <ContactPage/>
            </GuestGuard>
          }
        />

        
        <Route
          path="/about"
          element={
            <GuestGuard>
              <AboutPage/>
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
                  path=""
                  element={
                    <RegistrationGuard>
                      <DashboardLayout>
                        <Outlet />
                      </DashboardLayout>
                    </RegistrationGuard>
                  }
                >
                  <Route path="home" element={<DashboardHome />} />
                  <Route path="text-editor" element={<TextEditor />} />
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
