import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Suspense, lazy, useContext } from "react";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import AuthInitializer from "./components/AuthInitializer";
import { DarkModeContext, DarkModeProvider } from "./contexts/DarkModeContext";
import { useAppSelector } from "./store/hooks";
import Shimmer from "./components/ui/Shimmer";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const AIPage = lazy(() => import("./pages/AIPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome"));
const TextEditor = lazy(() => import("./pages/dashboard/TextEditor"));

function AppContent() {
  const { isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth
  );
  const { darkMode } = useContext(DarkModeContext)!;

  if (isLoading) {
    return <Shimmer theme={darkMode ? "dark" : "light"} />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<Shimmer theme={darkMode ? "dark" : "light"} />}>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/home" /> : <LandingPage />
            }
          />
          <Route
            path="/ai"
            element={isAuthenticated ? <Navigate to="/home" /> : <AIPage />}
          />
          <Route
            path="/contact"
            element={
              isAuthenticated ? <Navigate to="/home" /> : <ContactPage />
            }
          />
          <Route
            path="/about"
            element={isAuthenticated ? <Navigate to="/home" /> : <AboutPage />}
          />
          <Route
            path="auth/*"
            element={
              isAuthenticated ? (
                <Navigate to="/home" />
              ) : (
                <AuthLayout>
                  <Outlet />
                </AuthLayout>
              )
            }
          >
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
          </Route>
          <Route
            path=""
            element={
              isAuthenticated ? (
                <DarkModeProvider>
                  <DashboardLayout>
                    <Outlet />
                  </DashboardLayout>
                </DarkModeProvider>
              ) : (
                <Navigate to="/auth/login" />
              )
            }
          >
            <Route path="home" element={<DashboardHome />} />
            <Route path="text-editor" element={<TextEditor />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthInitializer>
      <AppContent />
    </AuthInitializer>
  );
}

export default App;
