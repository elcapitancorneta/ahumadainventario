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
        router.push("/");
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

      <style jsx global>{`
        .login-wrapper {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #0b0f19;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 9999;
          overflow: hidden;
          padding: 20px;
        }

        .login-background-glow {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.15;
        }

        .orb-1 {
          width: 400px;
          height: 400px;
          background-color: #0070f3;
          top: -100px;
          right: -100px;
          animation: float 20s infinite alternate;
        }

        .orb-2 {
          width: 500px;
          height: 500px;
          background-color: #7928ca;
          bottom: -150px;
          left: -150px;
          animation: float 25s infinite alternate-reverse;
        }

        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(50px, 50px) scale(1.1); }
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          padding: 40px;
          border-radius: 20px;
          text-align: center;
          box-shadow: var(--shadow-2xl);
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          z-index: 10;
        }

        .login-logo-container {
          margin-bottom: 24px;
          display: flex;
          justify-content: center;
        }

        .login-logo {
          object-fit: contain;
        }

        .login-title {
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }

        .login-subtitle {
          font-size: 13px;
          color: hsl(var(--text-muted));
          margin-bottom: 30px;
        }

        .login-tabs {
          display: flex;
          background-color: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 4px;
          border-radius: 10px;
          margin-bottom: 24px;
        }

        .login-tab-btn {
          flex: 1;
          padding: 10px;
          background: transparent;
          border: none;
          color: hsl(var(--text-secondary));
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 7px;
          transition: all var(--transition-fast);
        }

        .login-tab-btn:hover {
          color: #ffffff;
        }

        .login-tab-btn.active {
          background-color: hsl(var(--primary));
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(0, 112, 243, 0.25);
        }

        .login-error-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background-color: hsl(var(--danger-bg));
          border: 1px solid hsl(var(--danger) / 0.3);
          color: hsl(var(--danger));
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          text-align: left;
          margin-bottom: 20px;
        }

        .error-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        .login-form {
          text-align: left;
        }

        .lector-info-box p {
          font-size: 13px;
          line-height: 1.6;
          color: hsl(var(--text-secondary));
          text-align: center;
          margin-bottom: 24px;
        }

        .form-group {
          margin-bottom: 18px;
        }

        .form-group label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: hsl(var(--text-muted));
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }

        .form-group input {
          width: 100%;
        }

        .login-submit-btn {
          width: 100%;
          padding: 14px;
          font-size: 14px;
          font-weight: 700;
          border-radius: 10px;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}
