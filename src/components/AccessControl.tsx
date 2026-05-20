"use client";

import { useState, useEffect } from "react";

export default function AccessControl() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check login status on mount
  useEffect(() => {
    fetch("/api/auth/login")
      .then((res) => res.json())
      .then((data) => setIsAdmin(data.isAdmin))
      .catch(() => {});
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAdmin(data.isAdmin);
        setShowModal(false);
        setPassword("");
        setUsername("");
        // Reload page to refresh all Server Components and enable edit modes
        window.location.reload();
      } else {
        setError(data.error || "Usuario o contraseña incorrectos");
      }
    } catch {
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm("¿Estás seguro de que deseas cerrar tu sesión actual?")) {
      try {
        const res = await fetch("/api/auth/login", { method: "DELETE" });
        if (res.ok) {
          setIsAdmin(false);
          // Redirect to login page
          window.location.href = "/login";
        }
      } catch {}
    }
  };

  return (
    <>
      <div 
        className="sidebar-footer" 
        style={{ cursor: "pointer" }} 
        onClick={isAdmin ? handleLogout : () => setShowModal(true)}
        title={isAdmin ? "Hacer clic para cerrar sesión" : "Hacer clic para iniciar sesión como Admin"}
      >
        <div className={`status-indicator ${isAdmin ? "admin" : ""}`}>
          <div className="status-dot"></div>
          <div className="status-info">
            <span className="status-label">Modo Acceso</span>
            <span className="status-value">{isAdmin ? "Escritura (Admin)" : "Lectura"}</span>
          </div>
        </div>
      </div>

      {/* Login Glassmorphism Modal */}
      {showModal && (
        <div className="modal-overlay animate-fade-in" style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(8px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div className="card-glass content-card" style={{
            maxWidth: "400px",
            width: "100%",
            padding: "32px",
            border: "1px solid hsl(var(--primary) / 0.3)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.8)"
          }} onClick={(e) => e.stopPropagation()}>
            
            <h2 className="card-title" style={{ marginBottom: "8px" }}>Ingreso Personal TI</h2>
            <p style={{ fontSize: "14px", color: "hsl(var(--text-secondary))", marginBottom: "24px" }}>
              Introduce tus credenciales de TI para habilitar el modo de edición y registro.
            </p>

            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label htmlFor="admin-user">Usuario:</label>
                <input
                  id="admin-user"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej. dnavarro"
                  autoFocus
                  required
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="admin-pass">Contraseña:</label>
                <input
                  id="admin-pass"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Introduce tu contraseña..."
                  required
                />
                {error && (
                  <p style={{ color: "hsl(var(--danger))", fontSize: "13px", marginTop: "8px", fontWeight: 600 }}>
                    {error}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setShowModal(false);
                    setPassword("");
                    setUsername("");
                    setError("");
                  }}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={loading}
                >
                  {loading ? "Verificando..." : "Acceder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
