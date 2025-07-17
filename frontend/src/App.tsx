import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from './guards/AuthGuard';
import GuestGuard from './guards/GuestGuard';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GuestGuard><LandingPage /></GuestGuard>} />
        <Route path="/auth/login" element={<GuestGuard><Login /></GuestGuard>} />
        <Route path="/auth/register" element={<GuestGuard><Register /></GuestGuard>} />
        <Route
          path="/dashboard" 
          element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          }
        />
        <Route path="/auth/login" element={<div>Login Page (dummy)</div>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
