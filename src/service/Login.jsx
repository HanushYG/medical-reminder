import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("patient");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await login(email, role);
    if (result.success) {
      nav("/dashboard");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="fade-in" style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      minHeight: "60vh" 
    }}>
      <div className="card" style={{ 
        padding: "48px", 
        maxWidth: "480px", 
        width: "100%",
        textAlign: "center"
      }}>
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ 
            fontSize: "2.5rem",
            background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "8px"
          }}>
            🔑 Welcome Back
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
            Sign in to access your medication tracker
          </p>
        </div>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: "24px" }}>
          <div>
            <label style={{ 
              display: "block", 
              color: "var(--text-primary)", 
              marginBottom: "8px", 
              fontWeight: "500",
              textAlign: "left"
            }}>
              📧 Email Address
            </label>
            <input 
              type="email"
              placeholder="Enter your email address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div>
            <label style={{ 
              display: "block", 
              color: "var(--text-primary)", 
              marginBottom: "8px", 
              fontWeight: "500",
              textAlign: "left"
            }}>
              👤 Role
            </label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="patient">👤 Patient</option>
              <option value="doctor">👩‍⚕️ Doctor</option>
            </select>
          </div>
          
          <button type="submit" className="primary" style={{ 
            padding: "16px", 
            fontSize: "1.1rem", 
            fontWeight: "600",
            marginTop: "8px"
          }}>
            🚀 Sign In
          </button>
          
          {error && (
            <div style={{ 
              padding: "16px", 
              background: "rgba(255, 107, 107, 0.1)", 
              borderRadius: "8px",
              border: "1px solid var(--accent-danger)",
              textAlign: "center"
            }}>
              <p style={{ 
                color: "var(--accent-danger)", 
                fontSize: "1rem",
                fontWeight: "600",
                margin: "0 0 12px 0"
              }}>
                ❌ {error}
              </p>
              {error.toLowerCase().includes('invalid credentials') && (
                <div>
                  <p style={{ 
                    color: "var(--text-secondary)", 
                    fontSize: "0.9rem",
                    margin: "0 0 12px 0"
                  }}>
                    No account found with this email and role.
                  </p>
                  <button 
                    type="button"
                    onClick={() => nav('/signup')}
                    className="primary"
                    style={{ 
                      padding: "12px 24px",
                      fontSize: "1rem"
                    }}
                  >
                    ✨ Create Account
                  </button>
                </div>
              )}
            </div>
          )}
          
          <div style={{ 
            padding: "16px", 
            background: "rgba(0, 212, 170, 0.1)", 
            borderRadius: "8px",
            border: "1px solid var(--accent-primary)"
          }}>
            <p style={{ 
              color: "var(--text-secondary)", 
              fontSize: "0.9rem",
              margin: 0
            }}>
              💡 <strong>Demo Mode:</strong> No password required for this demonstration
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
