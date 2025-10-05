import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = 'http://localhost:5000/api';

function getAuthToken() {
  return localStorage.getItem('auth_token');
}

async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const msg = error.error || 'API request failed';
    
    if (response.status === 401) {
      throw new Error('Not authenticated');
    }
    
    throw new Error(msg);
  }
  
  return response.json();
}

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientMedicines, setPatientMedicines] = useState([]);
  const [patientDoses, setPatientDoses] = useState([]);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/doctor/patients');
      setPatients(response.patients || []);
    } catch (error) {
      console.error('Failed to load patients:', error);
      
      if (error.message === 'Not authenticated') {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        navigate('/login', { replace: true });
        return;
      }
      
      alert('Failed to load patients: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientData = async (patientId) => {
    try {
      setSelectedPatient(patientId);
      setPatientMedicines([]);
      setPatientDoses([]);
      
      // Load medicines
      try {
        const medicinesResponse = await apiRequest(`/doctor/patients/${patientId}/medicines`);
        setPatientMedicines(medicinesResponse.medicines || []);
      } catch (error) {
        console.error('Failed to load medicines:', error);
      }
      
      // Load doses (separately so one failure doesn't block the other)
      try {
        const dosesResponse = await apiRequest(`/doctor/patients/${patientId}/doses?limit=20`);
        setPatientDoses(dosesResponse.doses || []);
      } catch (error) {
        console.error('Failed to load doses:', error);
        // Don't show alert for doses - just log it
      }
    } catch (error) {
      console.error('Failed to load patient data:', error);
      
      if (error.message === 'Not authenticated') {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        navigate('/login', { replace: true });
        return;
      }
    }
  };

  return (
    <div className="fade-in" style={{ display: "grid", gap: "24px" }}>
      <div className="card" style={{ textAlign: "center", padding: "32px" }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          gap: "16px",
          marginBottom: "16px"
        }}>
          <div style={{ fontSize: "3rem" }}>👨‍⚕️</div>
          <h2 style={{ 
            fontSize: "2.5rem",
            background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            margin: 0
          }}>
            Doctor Dashboard
          </h2>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
          Monitor your patients' medication adherence
        </p>
      </div>

      <div className="card" style={{ padding: "24px" }}>
        <h3 style={{ color: "var(--text-primary)", marginBottom: "20px", fontSize: "1.5rem" }}>
          👥 Patients ({patients.length})
        </h3>
        
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-secondary)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "16px" }}>⏳</div>
            <p>Loading patients...</p>
          </div>
        ) : patients.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "48px 24px",
            background: "var(--bg-secondary)",
            borderRadius: "12px",
            border: "2px dashed var(--border-color)"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>👥</div>
            <h3 style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>No patients found</h3>
            <p style={{ color: "var(--text-muted)" }}>Patients will appear here once they register</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {patients.map((patient, index) => (
              <div 
                key={patient._id}
                className="slide-in card"
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  padding: "20px",
                  background: selectedPatient === patient._id ? "rgba(0, 212, 170, 0.1)" : "var(--bg-secondary)",
                  border: selectedPatient === patient._id ? "1px solid var(--accent-primary)" : "1px solid var(--border-color)",
                  animationDelay: `${index * 0.1}s`,
                  cursor: "pointer"
                }}
                onClick={() => loadPatientData(patient._id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ fontSize: "2rem" }}>👤</div>
                  <div>
                    <div style={{ 
                      fontSize: "1.2rem", 
                      fontWeight: "600", 
                      color: "var(--text-primary)",
                      marginBottom: "4px"
                    }}>
                      {patient.email}
                    </div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                      Role: {patient.role} • Last login: {new Date(patient.lastLogin).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div style={{ 
                  padding: "8px 16px",
                  background: "var(--accent-primary)",
                  color: "var(--bg-primary)",
                  borderRadius: "20px",
                  fontSize: "0.9rem",
                  fontWeight: "600"
                }}>
                  {patient.medicineCount || 0} medicines
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPatient && (
        <>
          <div className="card" style={{ padding: "24px" }}>
            <h3 style={{ color: "var(--text-primary)", marginBottom: "20px", fontSize: "1.5rem" }}>
              💊 Patient Medicines ({patientMedicines.length})
            </h3>
            
            {patientMedicines.length === 0 ? (
              <div style={{ 
                textAlign: "center", 
                padding: "32px",
                background: "var(--bg-secondary)",
                borderRadius: "12px"
              }}>
                <p style={{ color: "var(--text-secondary)" }}>No medicines prescribed yet</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "12px" }}>
                {patientMedicines.map((medicine, index) => (
                  <div 
                    key={medicine._id}
                    className="slide-in card"
                    style={{ 
                      padding: "16px",
                      background: "var(--bg-secondary)",
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div>
                        <h4 style={{ color: "var(--text-primary)", marginBottom: "8px" }}>
                          💊 {medicine.name}
                        </h4>
                        <p style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>
                          <strong>Dosage:</strong> {medicine.dosage || "as directed"}
                        </p>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {medicine.times.map(time => (
                            <span 
                              key={time}
                              style={{ 
                                padding: "4px 8px",
                                background: "var(--accent-primary)",
                                color: "var(--bg-primary)",
                                borderRadius: "12px",
                                fontSize: "0.8rem"
                              }}
                            >
                              ⏰ {time}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: "24px" }}>
            <h3 style={{ color: "var(--text-primary)", marginBottom: "20px", fontSize: "1.5rem" }}>
              📊 Recent Dose History
            </h3>
            
            {patientDoses.length === 0 ? (
              <div style={{ 
                textAlign: "center", 
                padding: "32px",
                background: "var(--bg-secondary)",
                borderRadius: "12px"
              }}>
                <p style={{ color: "var(--text-secondary)" }}>No dose records yet</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "8px" }}>
                {patientDoses.slice(0, 10).map((dose, index) => (
                  <div 
                    key={dose._id}
                    style={{ 
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px",
                      background: "var(--bg-secondary)",
                      borderRadius: "8px",
                      border: dose.status === "taken" ? "1px solid var(--accent-success)" : "1px solid var(--border-color)"
                    }}
                  >
                    <div>
                      <span style={{ color: "var(--text-primary)", fontWeight: "500" }}>
                        {new Date(dose.date).toLocaleDateString()} at {dose.time}
                      </span>
                    </div>
                    <span style={{ 
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      background: dose.status === "taken" ? "var(--accent-success)" : dose.status === "missed" ? "var(--accent-danger)" : "var(--accent-warning)",
                      color: "var(--bg-primary)"
                    }}>
                      {dose.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
