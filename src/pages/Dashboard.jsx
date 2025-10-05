import React, { useEffect, useMemo, useState } from "react";
import { medicineAPI, doseAPI } from "../service/api.js";

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0,10);
}

export default function Dashboard() {
  const [medicines, setMedicines] = useState([]);
  const [doses, setDoses] = useState([]);
  const [date, setDate] = useState(todayISO());
  const [filter, setFilter] = useState("all"); // all | taken | not
  const [loading, setLoading] = useState(true);

  // Load medicines and doses from API
  useEffect(() => {
    loadDashboardData();
  }, [date]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [medicinesResponse, dosesResponse] = await Promise.all([
        medicineAPI.getAll(),
        doseAPI.getByDate(date)
      ]);
      setMedicines(medicinesResponse.medicines || []);
      setDoses(dosesResponse.doses || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      alert('Failed to load dashboard data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const todaysDoses = useMemo(() => {
    const result = [];
    for (const m of medicines) {
      const startOk = !m.schedule?.startDate || date >= m.schedule.startDate.slice(0, 10);
      const endOk = !m.schedule?.endDate || date <= m.schedule.endDate.slice(0, 10);
      if (!startOk || !endOk) continue;
      for (const t of m.times) {
        const doseId = `${date}|${m._id}|${t}`;
        const existingDose = doses.find(d => d.medicineId === m._id && d.time === t);
        result.push({
          id: doseId, 
          medId: m._id, 
          name: m.name, 
          dosage: m.dosage,
          time: t, 
          status: existingDose?.status || "scheduled", 
          ts: existingDose?.takenAt || null
        });
      }
    }
    return result.sort((a,b)=>a.time.localeCompare(b.time));
  }, [medicines, doses, date]);

  const visibleDoses = todaysDoses.filter(d => {
    if (filter === "taken") return d.status === "taken";
    if (filter === "not") return d.status !== "taken";
    return true;
  });

  const toggle = async (dose) => {
    try {
      const newStatus = dose.status === "taken" ? "not taken" : "taken";
      const timestamp = newStatus === "taken" ? new Date().toISOString() : null;
      
      await doseAPI.updateStatus(dose.id, newStatus, timestamp);
      
      // Reload data to reflect changes
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to update dose status:', error);
      alert('Failed to update dose status: ' + error.message);
    }
  };

  const takenCount = todaysDoses.filter(d => d.status === "taken").length;
  const totalCount = todaysDoses.length;

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
          <div style={{ 
            fontSize: "3rem",
            display: "inline-block"
          }}>
            📅
          </div>
          <h2 style={{ 
            fontSize: "2.5rem",
            background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            margin: 0
          }}>
            Today's Medicines
          </h2>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
          Track your medication adherence and stay healthy
        </p>
      </div>

      <div className="card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ color: "var(--text-primary)", fontWeight: "500" }}>📅 Date:</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e)=>setDate(e.target.value)}
              style={{ maxWidth: "150px" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ color: "var(--text-primary)", fontWeight: "500" }}>🔍 Filter:</label>
            <select value={filter} onChange={(e)=>setFilter(e.target.value)} style={{ maxWidth: "120px" }}>
              <option value="all">All</option>
              <option value="taken">Taken</option>
              <option value="not">Not taken</option>
            </select>
          </div>
          <div style={{ 
            padding: "8px 16px", 
            background: "var(--bg-tertiary)", 
            borderRadius: "20px",
            border: "1px solid var(--border-color)"
          }}>
            <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>
              ✅ {takenCount}/{totalCount} taken
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ 
            textAlign: "center", 
            padding: "48px",
            color: "var(--text-secondary)"
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "16px" }}>⏳</div>
            <p>Loading your medicines...</p>
          </div>
        ) : visibleDoses.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "48px 24px",
            background: "var(--bg-secondary)",
            borderRadius: "12px",
            border: "2px dashed var(--border-color)"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>💊</div>
            <h3 style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>No doses scheduled</h3>
            <p style={{ color: "var(--text-muted)" }}>Add some medicines to start tracking your health!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {visibleDoses.map((d, index) => (
              <div 
                key={d.id} 
                className="slide-in card"
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  padding: "20px",
                  background: d.status === "taken" ? "rgba(72, 219, 251, 0.1)" : "var(--bg-card)",
                  border: d.status === "taken" ? "1px solid var(--accent-success)" : "1px solid var(--border-color)",
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ 
                    fontSize: "1.5rem",
                    width: "40px",
                    textAlign: "center"
                  }}>
                    {d.status === "taken" ? "✅" : "⏰"}
                  </div>
                  <div>
                    <div style={{ 
                      fontSize: "1.2rem", 
                      fontWeight: "600", 
                      color: "var(--text-primary)",
                      marginBottom: "4px"
                    }}>
                      {d.time} — {d.name}
                    </div>
                    <div style={{ 
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem"
                    }}>
                      {d.dosage || "as directed"}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ 
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    background: d.status === "taken" ? "var(--accent-success)" : "var(--accent-warning)",
                    color: d.status === "taken" ? "var(--bg-primary)" : "var(--text-primary)"
                  }}>
                    {d.status}
                  </span>
                  
                  <button 
                    onClick={()=>toggle(d)}
                    className={d.status === "taken" ? "danger" : "primary"}
                    style={{ 
                      padding: "8px 16px", 
                      fontSize: "0.9rem",
                      minWidth: "120px"
                    }}
                  >
                    {d.status === "taken" ? "❌ Mark Not taken" : "✅ Mark Taken"}
                  </button>
                  
                  {d.ts && (
                    <span style={{ 
                      color: "var(--text-muted)", 
                      fontSize: "0.8rem",
                      fontStyle: "italic"
                    }}>
                      at {new Date(d.ts).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
