import React, { useMemo, useState } from "react";
import { loadData } from "../service/storage.js";
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
  const data = loadData();
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 6); return d.toISOString().slice(0,10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0,10));

  const series = useMemo(() => {
    const days = dateRange(from, to);
    return days.map(day => {
      const dosesForDay = [];
      for (const m of data.medicines) {
        const startOk = !m.startDate || day >= m.startDate;
        const endOk = !m.endDate || day <= m.endDate;
        if (!startOk || !endOk) continue;
        for (const t of m.times) {
          const id = `${day}|${m.id}|${t}`;
          const rec = data.doses.find(d => d.id === id);
          dosesForDay.push(rec?.status === "Taken" ? "Taken" : "Missed");
        }
      }
      const taken = dosesForDay.filter(s => s === "Taken").length;
      const missed = dosesForDay.filter(s => s === "Missed").length;
      return { date: day, Taken: taken, Missed: missed };
    });
  }, [from, to, data]);

  return (
    <div className="fade-in" style={{ display: "grid", gap: "24px" }}>
      <div className="card" style={{ textAlign: "center", padding: "32px" }}>
        <h2 style={{ 
          fontSize: "2.5rem",
          background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: "8px"
        }}>
          📈 Analytics Dashboard
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
          </div>
        )}
      </div>
    </div>
  );
}
