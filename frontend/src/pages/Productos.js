import { useEffect, useState } from "react";
import { apiFetch } from "../api";

const emptyForm = {
  nombre: "",
  descripcion: "",
  precio: "",
  stock: "",
  id_categoria: "",
  id_proveedor: "",
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "10px 14px",
  border: "1px solid rgba(0,0,0,0.1)",
  borderRadius: 10,
  fontSize: 14,
  background: "rgba(255,255,255,0.7)",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: "#64748b",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  marginBottom: 5,
};

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const rol = localStorage.getItem("rol");

  const cargar = async () => {
    setLoading(true);
    try {
      const [p, c, pr] = await Promise.all([
        apiFetch("/productos"),
        apiFetch("/categorias"),
        apiFetch("/proveedores"),
      ]);
      setProductos(p || []);
      setCategorias(c || []);
      setProveedores(pr || []);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editId) {
        await apiFetch(`/productos/${editId}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      } else {
        await apiFetch("/productos", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }
      setForm(emptyForm);
      setEditId(null);
      cargar();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleEdit = (p) => {
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion || "",
      precio: p.precio,
      stock: p.stock,
      id_categoria: p.id_categoria,
      id_proveedor: p.id_proveedor,
    });
    setEditId(p.id_producto);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      await apiFetch(`/productos/${id}`, { method: "DELETE" });
      cargar();
    } catch (e) {
      setError(e.message);
    }
  };

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
        <p style={{ color: "#94a3b8" }}>Cargando...</p>
      </div>
    );

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
        Productos
      </h2>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 28 }}>
        Gestión de inventario
      </p>

      {rol === "admin" && (
        <div
          style={{
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.8)",
            borderRadius: 16,
            padding: 28,
            marginBottom: 28,
            boxShadow: "0 4px 24px rgba(100,180,255,0.1)",
          }}
        >
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#0f2027",
              margin: "0 0 20px",
            }}
          >
            {editId ? "Editar producto" : "Nuevo producto"}
          </h3>
          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 10,
                padding: "10px 14px",
                color: "#dc2626",
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <div>
              <label style={labelStyle}>Nombre *</label>
              <input
                style={inputStyle}
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Precio *</label>
              <input
                style={inputStyle}
                type="number"
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Stock *</label>
              <input
                style={inputStyle}
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Descripción</label>
              <input
                style={inputStyle}
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
              />
            </div>
            <div>
              <label style={labelStyle}>Categoría *</label>
              <select
                style={inputStyle}
                value={form.id_categoria}
                onChange={(e) =>
                  setForm({ ...form, id_categoria: e.target.value })
                }
                required
              >
                <option value="">Seleccionar...</option>
                {categorias.map((c) => (
                  <option key={c.id_categoria} value={c.id_categoria}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Proveedor *</label>
              <select
                style={inputStyle}
                value={form.id_proveedor}
                onChange={(e) =>
                  setForm({ ...form, id_proveedor: e.target.value })
                }
                required
              >
                <option value="">Seleccionar...</option>
                {proveedores.map((p) => (
                  <option key={p.id_proveedor} value={p.id_proveedor}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: "1/-1", display: "flex", gap: 10 }}>
              <button
                type="submit"
                style={{
                  background: "linear-gradient(135deg, #0f2027, #2c5364)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 24px",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {editId ? "Actualizar" : "Crear producto"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setForm(emptyForm);
                    setEditId(null);
                  }}
                  style={{
                    background: "rgba(0,0,0,0.06)",
                    color: "#334155",
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 20px",
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div
        style={{
          background: "rgba(255,255,255,0.6)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.8)",
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(100,180,255,0.1)",
          overflow: "hidden",
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
        >
          <thead>
            <tr
              style={{
                background: "linear-gradient(135deg, #0f2027, #2c5364)",
              }}
            >
              {[
                "Nombre",
                "Categoría",
                "Proveedor",
                "Precio",
                "Stock",
                rol === "admin" ? "Acciones" : "",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    color: "rgba(255,255,255,0.85)",
                    fontWeight: 500,
                    fontSize: 12,
                    letterSpacing: "0.3px",
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
                key={p.id_producto}
                style={{
                  borderBottom: "1px solid rgba(0,0,0,0.04)",
                  background:
                    i % 2 === 0 ? "transparent" : "rgba(241,245,249,0.5)",
                }}
              >
                <td
                  style={{
                    padding: "12px 16px",
                    fontWeight: 500,
                    color: "#0f2027",
                  }}
                >
                  {p.nombre}
                </td>
                <td style={{ padding: "12px 16px", color: "#475569" }}>
                  {p.categoria}
                </td>
                <td style={{ padding: "12px 16px", color: "#475569" }}>
                  {p.proveedor}
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    color: "#0ea5e9",
                    fontWeight: 600,
                  }}
                >
                  Q{parseFloat(p.precio).toFixed(2)}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{
                      background:
                        p.stock < 10
                          ? "rgba(244,63,94,0.1)"
                          : "rgba(16,185,129,0.1)",
                      color: p.stock < 10 ? "#f43f5e" : "#10b981",
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {p.stock}
                  </span>
                </td>
                {rol === "admin" && (
                  <td style={{ padding: "12px 16px", display: "flex", gap: 8 }}>
                    <button
                      onClick={() => handleEdit(p)}
                      style={{
                        background: "rgba(14,165,233,0.1)",
                        color: "#0ea5e9",
                        border: "none",
                        borderRadius: 8,
                        padding: "5px 12px",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(p.id_producto)}
                      style={{
                        background: "rgba(244,63,94,0.1)",
                        color: "#f43f5e",
                        border: "none",
                        borderRadius: 8,
                        padding: "5px 12px",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
