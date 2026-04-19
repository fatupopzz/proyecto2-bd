import { Link, useLocation } from "react-router-dom";
import { logout } from "../api";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/productos", label: "Productos" },
  { to: "/clientes", label: "Clientes" },
  { to: "/ventas", label: "Ventas" },
  { to: "/reportes", label: "Reportes" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const rol = localStorage.getItem("rol");

  return (
    <nav
      style={{
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        gap: 4,
        boxShadow: "0 2px 24px rgba(0,0,0,0.18)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <span
        style={{
          color: "#fff",
          fontWeight: 800,
          fontSize: 20,
          letterSpacing: "-0.5px",
          marginRight: 24,
          padding: "18px 0",
        }}
      >
        Tienda
      </span>

      {links.map((l) => {
        const active = pathname === l.to;
        return (
          <Link
            key={l.to}
            to={l.to}
            style={{
              color: active ? "#7dd3fc" : "rgba(255,255,255,0.65)",
              textDecoration: "none",
              padding: "20px 14px",
              fontSize: 14,
              fontWeight: active ? 600 : 400,
              letterSpacing: "0.2px",
              borderBottom: active
                ? "2px solid #7dd3fc"
                : "2px solid transparent",
              transition: "all 0.2s",
            }}
          >
            {l.label}
          </Link>
        );
      })}

      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <span
          style={{
            color: "rgba(255,255,255,0.45)",
            fontSize: 12,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          {rol}
        </span>
        <button
          onClick={logout}
          style={{
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 8,
            padding: "7px 16px",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
            backdropFilter: "blur(8px)",
            transition: "background 0.2s",
          }}
        >
          Salir
        </button>
      </div>
    </nav>
  );
}
