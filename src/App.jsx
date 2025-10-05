import Login from "./service/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DoctorDashboard from "./pages/DoctorDashboard.jsx";
import Medicines from "./pages/Medicines.jsx";
import Analytics from "./pages/Analytics.jsx";
import Logo from "./components/Logo.jsx";
import { ProtectedRoute, RoleRoute } from "./auth/ProtectedRoutes.jsx";
import { useAuth } from "./auth/AuthContext.jsx";
import { Routes, Route, Link, Navigate } from "react-router-dom";

export default function App() {
  const { user, logout } = useAuth();

  return (
    <div className="fade-in" style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, var(--bg-primary) 0%, #0d1b2a 100%)",
      padding: "0"
    }}>
      <header style={{ 
        background: "rgba(26, 26, 26, 0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border-color)",
        padding: "20px 0",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <div style={{ 
          maxWidth: 1200, 
          margin: "0 auto", 
          padding: "0 24px",
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <Logo size={36} />
            <h1 style={{ 
              fontSize: "1.8rem", 
              margin: 0,
              background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>
              MedTracker
            </h1>
          </Link>
          
          <nav style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Link to="/dashboard">📊 Dashboard</Link>
            {user?.role !== 'doctor' && <Link to="/medicines">💊 Medicines</Link>}
            <Link to="/analytics">📈 Analytics</Link>
            {!user && <Link to="/login">🔑 Login</Link>}
            {!user && <Link to="/signup">✨ Signup</Link>}
          </nav>
          
          {user && (
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "16px",
              padding: "8px 16px",
              background: "var(--bg-card)",
              borderRadius: "12px",
              border: "1px solid var(--border-color)"
            }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: "500" }}>
                  {user.email}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "capitalize" }}>
                  {user.role}
                </div>
              </div>
              <button 
                onClick={logout}
                className="danger"
                style={{ padding: "8px 16px", fontSize: "14px" }}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main style={{ 
        maxWidth: 1200, 
        margin: "0 auto", 
        padding: "32px 24px",
        minHeight: "calc(100vh - 100px)"
      }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route element={<ProtectedRoute />}>
            <Route 
              path="/dashboard" 
              element={
                user?.role === 'doctor' ? <DoctorDashboard /> : <Dashboard />
              } 
            />
            <Route path="/medicines" element={
              <RoleRoute allowed={["patient", "caregiver"]}>
                <Medicines />
              </RoleRoute>
            } />
            <Route
              path="/analytics"
              element={
                <RoleRoute allowed={["patient", "caregiver", "doctor"]}>
                  <Analytics />
                </RoleRoute>
              }
            />
          </Route>

          <Route path="*" element={
            <div className="card fade-in" style={{ textAlign: "center", padding: "64px 32px" }}>
              <h2 style={{ color: "var(--accent-danger)", marginBottom: "16px" }}>404 Not Found</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
                The page you're looking for doesn't exist.
              </p>
              <Link to="/dashboard" className="primary">
                🏠 Go to Dashboard
              </Link>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}