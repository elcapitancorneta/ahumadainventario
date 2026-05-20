"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RepairFormProps {
  deviceId: string;
}

export default function RepairForm({ deviceId }: RepairFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form states
  const [descripcionFalla, setDescripcionFalla] = useState("");
  const [tecnicoEncargado, setTecnicoEncargado] = useState("Soporte TI");
  const [estado, setEstado] = useState("EN_PROCESO");
  const [solucion, setSolucion] = useState("");
  const [costo, setCosto] = useState("");
  const [updateDeviceStatus, setUpdateDeviceStatus] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const payload = {
      dispositivoId: deviceId,
      descripcionFalla,
      tecnicoEncargado,
      estado,
      solucion: solucion || null,
      costo: costo ? parseFloat(costo) : null,
      updateDeviceStatus,
    };

    try {
      const res = await fetch("/api/reparaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setSuccess(true);
        setDescripcionFalla("");
        setSolucion("");
        setCosto("");
        router.refresh(); // Reload repair history on the page
      } else {
        setError(result.error || "Ocurrió un error al registrar la reparación.");
      }
    } catch {
      setError("Error de conexión al guardar la reparación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-glass content-card" style={{ marginTop: "24px", border: "1px solid hsl(var(--warning) / 0.2)" }}>
      <h2 className="card-title" style={{ color: "hsl(var(--warning))", display: "flex", alignItems: "center", gap: "8px" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
        Registrar Acción de Soporte / Falla
      </h2>

      {error && (
        <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "hsl(var(--danger-bg))", border: "1px solid hsl(var(--danger) / 0.3)", color: "hsl(var(--danger))", fontWeight: 600, fontSize: "14px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "hsl(var(--success-bg))", border: "1px solid hsl(var(--success) / 0.3)", color: "hsl(var(--success))", fontWeight: 600, fontSize: "14px", marginBottom: "16px" }}>
          ¡Acción de soporte registrada exitosamente!
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label htmlFor="rep-falla">Descripción de la Falla / Incidencia</label>
          <textarea
            id="rep-falla"
            rows={3}
            value={descripcionFalla}
            onChange={(e) => setDescripcionFalla(e.target.value)}
            placeholder="Describe en detalle el síntoma, problema o tipo de mantenimiento..."
            required
          />
        </div>

        <div className="tech-specs-grid">
          <div className="spec-item">
            <label htmlFor="rep-tecnico">Técnico / Encargado</label>
            <input
              id="rep-tecnico"
              type="text"
              value={tecnicoEncargado}
              onChange={(e) => setTecnicoEncargado(e.target.value)}
              placeholder="Nombre del técnico..."
              required
            />
          </div>

          <div className="spec-item">
            <label htmlFor="rep-estado">Estado de la Reparación</label>
            <select id="rep-estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="EN_PROCESO">EN PROCESO / PENDIENTE</option>
              <option value="RESUELTO">RESUELTO</option>
              <option value="IRREPARABLE">IRREPARABLE / DE BAJA</option>
            </select>
          </div>

          <div className="spec-item">
            <label htmlFor="rep-costo">Costo del Soporte (CLP)</label>
            <input
              id="rep-costo"
              type="number"
              value={costo}
              onChange={(e) => setCosto(e.target.value)}
              placeholder="Costo total en pesos chilenos..."
            />
          </div>

          <div className="spec-item" style={{ justifyContent: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", height: "100%", marginTop: "16px" }}>
              <input
                type="checkbox"
                checked={updateDeviceStatus}
                onChange={(e) => setUpdateDeviceStatus(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <span style={{ fontSize: "14px", fontWeight: 600, color: "hsl(var(--text-secondary))" }}>
                Actualizar estado del equipo automáticamente
              </span>
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="rep-solucion">Solución Aplicada (Opcional)</label>
          <textarea
            id="rep-solucion"
            rows={2}
            value={solucion}
            onChange={(e) => setSolucion(e.target.value)}
            placeholder="Detalla qué reparaciones se hicieron (si ya se resolvió)..."
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading} style={{ backgroundColor: "hsl(var(--warning))" }}>
            {loading ? "Registrando..." : "Registrar Reparación"}
          </button>
        </div>
      </form>
    </div>
  );
}
