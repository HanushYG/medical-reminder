import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("patient");

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await signup(email, role);
    if (result.success) {
      nav("/dashboard");
    } else {
      alert(`Signup failed: ${result.error}`);
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
            ✨ Join MedTracker
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
            Create your account to start tracking your medications
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
              👤 Select Your Role
            </label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="patient">👤 Patient - Track your own medications</option>
              <option value="caregiver">👨‍👩‍👧‍👦 Caregiver - Help others with their medications</option>
              <option value="doctor">👩‍⚕️ Doctor - Monitor patient adherence</option>
            </select>
          </div>
          
          <button type="submit" className="primary" style={{ 
            padding: "16px", 
            fontSize: "1.1rem", 
            fontWeight: "600",
            marginTop: "8px"
          }}>
            🎉 Create Account
          </button>
          
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
              💡 <strong>Quick Setup:</strong> Just enter your email and role to get started instantly
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
