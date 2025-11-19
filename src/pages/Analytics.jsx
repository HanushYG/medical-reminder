import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { medicineAPI, analyticsAPI, doctorAPI } from "../service/api.js";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";

function dateRange(from, to) {
  const out = [];
  const d = new Date(from);
  const end = new Date(to);
  while (d <= end) {
    out.push(d.toISOString().slice(0,10));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export default function Analytics() {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [adherenceData, setAdherenceData] = useState(null);
  const [patientBreakdown, setPatientBreakdown] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 6); return d.toISOString().slice(0,10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0,10));

  // Check if user is a doctor
  const userRole = useMemo(() => {
    const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
    return user.role;
  }, []);

  const isDoctor = userRole === 'doctor';

  // Load analytics data from API
  useEffect(() => {
    loadAnalytics();
  }, [from, to, isDoctor]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      if (isDoctor) {
        // Load aggregated analytics for all patients
        const response = await doctorAPI.getAllPatientsAnalytics(from, to);
        setAdherenceData({ daily: response.daily });
        setPatientBreakdown(response.patientBreakdown || []);
        setTotalPatients(response.totalPatients || 0);
      } else {
        // Load individual patient analytics
        const [medicinesResponse, adherenceResponse] = await Promise.all([
          medicineAPI.getAll(),
          analyticsAPI.getAdherence(from, to)
        ]);
        setMedicines(medicinesResponse.medicines || []);
        setAdherenceData(adherenceResponse);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      
      // Handle authentication errors
      if (error.message === 'Not authenticated') {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        navigate('/login', { replace: true });
        return;
      }
      
      alert('Failed to load analytics: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const series = useMemo(() => {
    if (!adherenceData || !adherenceData.daily) return [];
    return adherenceData.daily.map(day => ({
      date: day.date,
      Taken: day.taken || 0,
      Missed: day.missed || 0
    }));
  }, [adherenceData]);

  return (
    <div className="fade-in" style={{ display: "grid", gap: "24px" }}>
      <div className="card" style={{ textAlign: "center", padding: "32px" }}>
        <h2 style={{ 
          fontSize: "2.5rem",
          marginBottom: "8px",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          <span>📈</span>
          <span style={{
            background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>Analytics Dashboard</span>
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
          Track your medication adherence and health progress
        </p>
      </div>

      <div className="card" style={{ padding: "24px" }}>
        <h3 style={{ color: "var(--text-primary)", marginBottom: "20px", fontSize: "1.5rem" }}>
          📅 Date Range Selection
        </h3>
        
        <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap", marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ color: "var(--text-primary)", fontWeight: "500" }}>📅 From:</label>
            <input 
              type="date" 
              value={from} 
              onChange={(e)=>setFrom(e.target.value)}
              style={{ maxWidth: "150px" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ color: "var(--text-primary)", fontWeight: "500" }}>📅 To:</label>
            <input 
              type="date" 
              value={to} 
              onChange={(e)=>setTo(e.target.value)}
              style={{ maxWidth: "150px" }}
            />
          </div>
          <div style={{ 
            padding: "8px 16px", 
            background: "var(--bg-tertiary)", 
            borderRadius: "20px",
            border: "1px solid var(--border-color)"
          }}>
            <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>
              📊 {series.length} days analyzed
            </span>
          </div>
        </div>

        {series.length > 0 ? (
          <div style={{ 
            width: "100%", 
            height: "400px",
            background: "var(--bg-secondary)",
            borderRadius: "12px",
            padding: "16px",
            border: "1px solid var(--border-color)"
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--text-secondary)"
                  fontSize={12}
                  tick={{ fill: 'var(--text-secondary)' }}
                />
                <YAxis 
                  allowDecimals={false} 
                  stroke="var(--text-secondary)"
                  fontSize={12}
                  tick={{ fill: 'var(--text-secondary)' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="Taken" 
                  fill="var(--accent-success)"
                  radius={[4, 4, 0, 0]}
                  name="✅ Taken"
                />
                <Bar 
                  dataKey="Missed" 
                  fill="var(--accent-danger)"
                  radius={[4, 4, 0, 0]}
                  name="❌ Missed"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ 
            textAlign: "center", 
            padding: "48px 24px",
            background: "var(--bg-secondary)",
            borderRadius: "12px",
            border: "2px dashed var(--border-color)"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📊</div>
            <h3 style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>No data available</h3>
            <p style={{ color: "var(--text-muted)" }}>Select a date range to view your medication adherence analytics</p>
          </div>
        )}

        {series.length > 0 && (
          <div style={{ 
            marginTop: "24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px"
          }}>
            <div className="card" style={{ 
              padding: "20px",
              background: "rgba(72, 219, 251, 0.1)",
              border: "1px solid var(--accent-success)"
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "8px" }}>✅</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--accent-success)" }}>
                {series.reduce((sum, day) => sum + day.Taken, 0)}
              </div>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Doses Taken</div>
            </div>
            
            <div className="card" style={{ 
              padding: "20px",
              background: "rgba(255, 107, 107, 0.1)",
              border: "1px solid var(--accent-danger)"
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "8px" }}>❌</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--accent-danger)" }}>
                {series.reduce((sum, day) => sum + day.Missed, 0)}
              </div>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Doses Missed</div>
            </div>
            
            <div className="card" style={{ 
              padding: "20px",
              background: "rgba(0, 212, 170, 0.1)",
              border: "1px solid var(--accent-primary)"
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📈</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--accent-primary)" }}>
                {series.length > 0 ? Math.round((series.reduce((sum, day) => sum + day.Taken, 0) / series.reduce((sum, day) => sum + day.Taken + day.Missed, 0)) * 100) : 0}%
              </div>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Adherence Rate</div>
            </div>

            {isDoctor && (
              <div className="card" style={{ 
                padding: "20px",
                background: "rgba(139, 92, 246, 0.1)",
                border: "1px solid #8b5cf6"
              }}>
                <div style={{ fontSize: "2rem", marginBottom: "8px" }}>👥</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#8b5cf6" }}>
                  {totalPatients}
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Total Patients</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Patient Breakdown Table - Only for Doctors */}
      {isDoctor && patientBreakdown.length > 0 && (
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ color: "var(--text-primary)", marginBottom: "20px", fontSize: "1.5rem" }}>
            👥 Patient Adherence Breakdown
          </h3>
          
          <div style={{ overflowX: "auto" }}>
            <table style={{ 
              width: "100%", 
              borderCollapse: "collapse",
              fontSize: "0.95rem"
            }}>
              <thead>
                <tr style={{ 
                  background: "var(--bg-secondary)",
                  borderBottom: "2px solid var(--border-color)"
                }}>
                  <th style={{ padding: "12px", textAlign: "left", color: "var(--text-primary)" }}>Patient Name</th>
                  <th style={{ padding: "12px", textAlign: "left", color: "var(--text-primary)" }}>Email</th>
                  <th style={{ padding: "12px", textAlign: "center", color: "var(--text-primary)" }}>✅ Taken</th>
                  <th style={{ padding: "12px", textAlign: "center", color: "var(--text-primary)" }}>❌ Missed</th>
                  <th style={{ padding: "12px", textAlign: "center", color: "var(--text-primary)" }}>📊 Total</th>
                  <th style={{ padding: "12px", textAlign: "center", color: "var(--text-primary)" }}>📈 Rate</th>
                </tr>
              </thead>
              <tbody>
                {patientBreakdown.map((patient, index) => (
                  <tr 
                    key={patient.patientId}
                    style={{ 
                      borderBottom: "1px solid var(--border-color)",
                      background: index % 2 === 0 ? "transparent" : "var(--bg-secondary)"
                    }}
                  >
                    <td style={{ padding: "12px", color: "var(--text-primary)" }}>
                      {patient.patientName || 'Unknown'}
                    </td>
                    <td style={{ padding: "12px", color: "var(--text-secondary)" }}>
                      {patient.patientEmail}
                    </td>
                    <td style={{ 
                      padding: "12px", 
                      textAlign: "center",
                      color: "var(--accent-success)",
                      fontWeight: "600"
                    }}>
                      {patient.taken}
                    </td>
                    <td style={{ 
                      padding: "12px", 
                      textAlign: "center",
                      color: "var(--accent-danger)",
                      fontWeight: "600"
                    }}>
                      {patient.missed}
                    </td>
                    <td style={{ 
                      padding: "12px", 
                      textAlign: "center",
                      color: "var(--text-primary)",
                      fontWeight: "600"
                    }}>
                      {patient.total}
                    </td>
                    <td style={{ 
                      padding: "12px", 
                      textAlign: "center"
                    }}>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontWeight: "600",
                        background: patient.adherenceRate >= 80 
                          ? "rgba(72, 219, 251, 0.2)" 
                          : patient.adherenceRate >= 50 
                          ? "rgba(255, 193, 7, 0.2)"
                          : "rgba(255, 107, 107, 0.2)",
                        color: patient.adherenceRate >= 80 
                          ? "var(--accent-success)" 
                          : patient.adherenceRate >= 50 
                          ? "#ffc107"
                          : "var(--accent-danger)"
                      }}>
                        {patient.adherenceRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {patientBreakdown.length === 0 && (
            <div style={{ 
              textAlign: "center", 
              padding: "32px",
              color: "var(--text-secondary)"
            }}>
              No patient data available for the selected date range
            </div>
          )}
        </div>
      )}
    </div>
  );
}
