"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"lector" | "admin">("lector");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    let loginUsername = username;
    let loginPassword = password;

    if (activeTab === "lector") {
      loginUsername = "lector";
      loginPassword = "lector";
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        router.push("/inventario");
        router.refresh();
      } else {
        setError(result.error || "Credenciales incorrectas.");
      }
    } catch {
      setError("Error de conexión con el servidor de autenticación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-background-glow">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
      </div>

      <div className="login-card card-glass animate-fade-in">
        <div className="login-logo-container">
          <Image
            src="/logo.svg"
            alt="Farmacias Ahumada Logo"
            width={180}
            height={60}
            priority
            className="login-logo"
          />
        </div>

        <h1 className="login-title">Portal de Inventario TI</h1>
        <p className="login-subtitle">Gestión Tecnológica y Soporte de Farmacias Ahumada</p>

        {/* Tab Selection */}
        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab-btn ${activeTab === "lector" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("lector");
              setError("");
            }}
          >
            Consulta (Lectura)
          </button>
          <button
            type="button"
            className={`login-tab-btn ${activeTab === "admin" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("admin");
              setError("");
            }}
          >
            Personal TI (Escritura)
          </button>
        </div>

        {error && (
          <div className="login-error-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="error-icon">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          {activeTab === "lector" ? (
            <div className="lector-info-box">
              <p>
                El acceso de consulta permite visualizar el inventario de notebooks, computadores de recetario,
                celulares y accesorios en tiempo real, sin permisos de modificación.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary login-submit-btn"
              >
                {loading ? "Accediendo..." : "Entrar como Lector"}
              </button>
            </div>
          ) : (
            <div className="admin-fields">
              <div className="form-group">
                <label htmlFor="username">Usuario</label>
                <input
                  id="username"
                  type="text"
                  placeholder="ej. dnavarro"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary login-submit-btn"
                style={{ marginTop: "10px" }}
              >
                {loading ? "Validando..." : "Iniciar Sesión"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
