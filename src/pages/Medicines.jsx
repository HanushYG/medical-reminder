import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { medicineAPI } from "../service/api.js";
import CapsuleIcon from "../components/icons/CapsuleIcon.jsx";

function toHHMM(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function Medicines() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [times, setTimes] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load medicines from API
  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const response = await medicineAPI.getAll();
      setList(response.medicines || []);
    } catch (error) {
      console.error('Failed to load medicines:', error);
      
      // Handle authentication errors
      if (error.message === 'Not authenticated') {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        navigate('/login', { replace: true });
        return;
      }
      
      alert('Failed to load medicines: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addTime = () => {
    const t = toHHMM(timeInput);
    if (!t) return;
    if (!times.includes(t)) setTimes([...times, t].sort());
    setTimeInput("");
  };

  const removeTime = (t) => setTimes(times.filter(x => x !== t));

  const addMedicine = async (e) => {
    e.preventDefault();
    if (!name || times.length === 0) return;
    
    try {
      const med = {
        name,
        dosage,
        times,
        startDate: startDate || null,
        endDate: endDate || null,
      };
      
      const response = await medicineAPI.create(med);
      setList((prev) => [...prev, response.medicine]);
      setName(""); setDosage(""); setTimes([]); setStartDate(""); setEndDate("");
      alert('Medicine saved successfully!');
    } catch (error) {
      console.error('Failed to save medicine:', error);
      
      // Handle authentication errors
      if (error.message === 'Not authenticated') {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        navigate('/login', { replace: true });
        return;
      }
      
      alert('Failed to save medicine: ' + error.message);
    }
  };

  const removeMedicine = async (id) => {
    try {
      await medicineAPI.delete(id);
      setList(list.filter(m => m._id !== id));
      alert('Medicine removed successfully!');
    } catch (error) {
      console.error('Failed to remove medicine:', error);
      
      // Handle authentication errors
      if (error.message === 'Not authenticated') {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        navigate('/login', { replace: true });
        return;
      }
      
      alert('Failed to remove medicine: ' + error.message);
    }
  };
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
          <span>💊</span>
          <span style={{
            background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>Medicine Management</span>
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
          Add and manage your medications with custom schedules
        </p>
      </div>
      <div className="card" style={{ padding: "32px" }}>
        <h3 style={{ color: "var(--text-primary)", marginBottom: "24px", fontSize: "1.5rem" }}>
          ➕ Add New Medicine
        </h3>
        
        <form onSubmit={addMedicine} style={{ display: "grid", gap: "20px", maxWidth: "600px" }}>
          <div>
            <label style={{ display: "block", color: "var(--text-primary)", marginBottom: "8px", fontWeight: "500" }}>
              💊 Medicine Name *
            </label>
            <input 
              placeholder="e.g., Aspirin, Metformin" 
              value={name} 
              onChange={(e)=>setName(e.target.value)} 
              required 
            />
          </div>
          
          <div>
            <label style={{ display: "block", color: "var(--text-primary)", marginBottom: "8px", fontWeight: "500" }}>
              📏 Dosage
            </label>
            <input 
              placeholder="e.g., 1 tablet, 500mg, 2 capsules" 
              value={dosage} 
              onChange={(e)=>setDosage(e.target.value)} 
            />
          </div>
          
          <div>
            <label style={{ display: "block", color: "var(--text-primary)", marginBottom: "8px", fontWeight: "500" }}>
              ⏰ Schedule Times *
            </label>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <input 
                type="time" 
                value={timeInput} 
                onChange={(e)=>setTimeInput(e.target.value)}
                style={{ maxWidth: "120px" }}
              />
              <button type="button" onClick={addTime} className="primary" style={{ padding: "8px 16px" }}>
                ➕ Add Time
              </button>
              <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Examples: 08:00, 14:00, 21:00
              </span>
            </div>
            
            {times.length > 0 && (
              <div style={{ marginTop: "12px", padding: "12px", background: "var(--bg-secondary)", borderRadius: "8px" }}>
                <div style={{ color: "var(--text-primary)", marginBottom: "8px", fontWeight: "500" }}>
                  Scheduled Times:
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {times.map(t => (
                    <button 
                      key={t} 
                      type="button" 
                      onClick={()=>removeTime(t)}
                      className="danger"
                      style={{ 
                        padding: "4px 12px", 
                        fontSize: "0.8rem",
                        borderRadius: "20px"
                      }}
                    >
                      ⏰ {t} ×
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", color: "var(--text-primary)", marginBottom: "8px", fontWeight: "500" }}>
                📅 Start Date
              </label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e)=>setStartDate(e.target.value)} 
              />
            </div>
            <div>
              <label style={{ display: "block", color: "var(--text-primary)", marginBottom: "8px", fontWeight: "500" }}>
                📅 End Date
              </label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e)=>setEndDate(e.target.value)} 
              />
            </div>
          </div>
          
          <button type="submit" className="primary" style={{ padding: "16px", fontSize: "1.1rem", fontWeight: "600" }} disabled={loading}>
            {loading ? "⏳ Saving..." : "💾 Save Medicine"}
          </button>
        </form>
      </div>

      {list.length > 0 && (
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ color: "var(--text-primary)", marginBottom: "20px", fontSize: "1.5rem" }}>
            📋 Your Medicines ({list.length})
          </h3>
          
          <div style={{ display: "grid", gap: "16px" }}>
            {list.map((m, index) => (
              <div 
                key={m._id}
                className="slide-in card"
                style={{ 
                  padding: "20px",
                  background: "var(--bg-secondary)",
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                      <div style={{ fontSize: "1.5rem" }}>💊</div>
                      <h4 style={{ 
                        color: "var(--text-primary)", 
                        fontSize: "1.3rem", 
                        fontWeight: "600",
                        margin: 0
                      }}>
                        {m.name}
                      </h4>
                    </div>
                    
                    <div style={{ marginBottom: "12px" }}>
                      <span style={{ color: "var(--text-secondary)" }}>
                        <strong>Dosage:</strong> {m.dosage || "as directed"}
                      </span>
                    </div>
                    
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ color: "var(--text-secondary)" }}>
                        <strong>Times:</strong> 
                      </span>
                      <div style={{ display: "flex", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
                        {m.times.map(time => (
                          <span 
                            key={time}
                            style={{ 
                              padding: "4px 8px",
                              background: "var(--accent-primary)",
                              color: "var(--bg-primary)",
                              borderRadius: "12px",
                              fontSize: "0.8rem",
                              fontWeight: "500"
                            }}
                          >
                            ⏰ {time}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {(m.startDate || m.endDate) && (
                      <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                        <strong>Schedule:</strong> 
                        {m.startDate ? ` from ${m.startDate}` : ""}
                        {m.endDate ? ` to ${m.endDate}` : ""}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={()=>removeMedicine(m._id)}
                    className="danger"
                    style={{ 
                      padding: "8px 16px",
                      fontSize: "0.9rem",
                      alignSelf: "flex-start"
                    }}
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {list.length === 0 && (
        <div className="card" style={{ 
          textAlign: "center", 
          padding: "48px 24px",
          background: "var(--bg-secondary)",
          border: "2px dashed var(--border-color)"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>💊</div>
          <h3 style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>No medicines added yet</h3>
          <p style={{ color: "var(--text-muted)" }}>Add your first medicine above to start tracking your health!</p>
        </div>
      )}
    </div>
  );
}
