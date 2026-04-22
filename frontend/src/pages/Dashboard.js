import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function Dashboard() {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  Promise.all([
    apiFetch('/reportes/ventas-diarias').catch(() => []),
    apiFetch('/productos/bajo-stock').catch(() => []),
  ]).then(([v, p]) => {
    setVentas(v || [])
    setProductos(p || [])
  }).finally(() => setLoading(false))
}, [])

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
        }}
      >
        <p style={{ color: "#94a3b8", fontSize: 15 }}>Cargando...</p>
      </div>
    );

  const totalHoy = ventas[0]?.ingresos_totales || 0;

  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <h2
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: "#0f2027",
          letterSpacing: "-0.5px",
          marginBottom: 6,
        }}
      >
        Dashboard
      </h2>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 28 }}>
        Resumen general de la tienda
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 16,
          marginBottom: 36,
        }}
      >
        <StatCard
          label="Ingresos recientes"
          value={`Q${parseFloat(totalHoy).toFixed(2)}`}
          color="#0ea5e9"
        />
        <StatCard
          label="Ventas recientes"
          value={ventas[0]?.total_ventas || 0}
          color="#6366f1"
        />
        <StatCard
          label="Productos bajo stock"
          value={productos.length}
          color="#f43f5e"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <GlassCard title="Ventas recientes">
          {ventas.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: 13 }}>Sin datos aún</p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  {["Día", "Ventas", "Ingresos"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "6px 8px",
                        textAlign: "left",
                        color: "#94a3b8",
                        fontWeight: 500,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ventas.slice(0, 6).map((r, i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
                  >
                    <td style={{ padding: "8px", color: "#334155" }}>
                      {r.dia}
                    </td>
                    <td style={{ padding: "8px", color: "#334155" }}>
                      {r.total_ventas}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        color: "#0ea5e9",
                        fontWeight: 600,
                      }}
                    >
                      Q{parseFloat(r.ingresos_totales).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </GlassCard>

        <GlassCard title="Productos con stock bajo">
          {productos.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: 13 }}>
              Todo el stock está bien
            </p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  {["Producto", "Categoría", "Stock"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "6px 8px",
                        textAlign: "left",
                        color: "#94a3b8",
                        fontWeight: 500,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {productos.map((p, i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
                  >
                    <td style={{ padding: "8px", color: "#334155" }}>
                      {p.nombre}
                    </td>
                    <td style={{ padding: "8px", color: "#334155" }}>
                      {p.categoria}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        fontWeight: 700,
                        color: "#f43f5e",
                      }}
                    >
                      {p.stock}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.8)",
        borderRadius: 16,
        padding: "24px",
        boxShadow: "0 4px 24px rgba(100,180,255,0.1)",
        borderLeft: `4px solid ${color}`,
      }}
    >
      <p
        style={{
          color: "#64748b",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 32,
          fontWeight: 800,
          color,
          margin: "8px 0 0",
          letterSpacing: "-1px",
        }}
      >
        {value}
      </p>
    </div>
  );
}

function GlassCard({ title, children }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.8)",
        borderRadius: 16,
        padding: "24px",
        boxShadow: "0 4px 24px rgba(100,180,255,0.1)",
      }}
    >
      <h3
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "#0f2027",
          margin: "0 0 16px",
          letterSpacing: "-0.3px",
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
