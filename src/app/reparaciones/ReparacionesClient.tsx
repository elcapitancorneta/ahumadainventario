"use client";

import { useState } from "react";
import Link from "next/link";

interface DeviceRef {
  id: string;
  marca: string;
  modelo: string;
  tipo: string;
}

interface RepairLog {
  id: string;
  dispositivoId: string;
  descripcionFalla: string;
  solucion: string | null;
  costo: number | null;
  tecnicoEncargado: string | null;
  estado: string;
  fechaEnvio: Date;
  fechaRetorno: Date | null;
  dispositivo: DeviceRef;
}

interface ReparacionesClientProps {
  initialRepairs: any[]; // Avoid complex type checking issues
}

export default function ReparacionesClient({ initialRepairs }: ReparacionesClientProps) {
  const [repairs, setRepairs] = useState<RepairLog[]>(initialRepairs);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");

  // Compute metrics
  const totalRepairs = repairs.length;
  const inProcess = repairs.filter((r) => r.estado === "EN_PROCESO").length;
  const resolved = repairs.filter((r) => r.estado === "RESUELTO").length;
  const totalCosts = repairs.reduce((sum, r) => sum + (r.costo || 0), 0);

  // Filter repairs
  const filtered = repairs.filter((r) => {
    const matchesSearch = 
      r.descripcionFalla.toLowerCase().includes(search.toLowerCase()) ||
      (r.solucion && r.solucion.toLowerCase().includes(search.toLowerCase())) ||
      (r.tecnicoEncargado && r.tecnicoEncargado.toLowerCase().includes(search.toLowerCase())) ||
      r.dispositivo.marca.toLowerCase().includes(search.toLowerCase()) ||
      r.dispositivo.modelo.toLowerCase().includes(search.toLowerCase());
      
    const matchesStatus = statusFilter === "TODOS" || r.estado === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatCLP = (val: number | null) => {
    if (val === null || val === undefined) return "$0";
    return `$${val.toLocaleString("es-CL")}`;
  };

  const formatDate = (dateStr: any) => {
    if (!dateStr) return "Pendiente";
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-CL");
  };

  return (
    <div className="inventario-content">
      {/* Header */}
      <header className="page-header">
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 28, height: 28, color: "hsl(var(--primary))" }}>
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
            Consolidado de Soporte y Reparaciones
          </h1>
          <p className="page-subtitle">Historial completo de mantenimiento de hardware e infraestructura de TI</p>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="card-glass metric-card">
          <span className="metric-label">Total Reparaciones</span>
          <span className="metric-value">{totalRepairs}</span>
        </div>
        <div className="card-glass metric-card">
          <span className="metric-label">En Soporte / Proceso</span>
          <span className="metric-value text-highlight">{inProcess}</span>
        </div>
        <div className="card-glass metric-card">
          <span className="metric-label">Tickets Solucionados</span>
          <span className="metric-value" style={{ color: "hsl(var(--success))" }}>{resolved}</span>
        </div>
        <div className="card-glass metric-card">
          <span className="metric-label">Costo Total de Mantenimiento</span>
          <span className="metric-value text-highlight" style={{ fontSize: "22px" }}>{formatCLP(totalCosts)}</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card-glass filters-bar">
        <div className="search-box">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por falla, solución, técnico o equipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>

        <div className="select-filters">
          <div className="filter-group">
            <label htmlFor="status-filter">Estado:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="TODOS">Todos los estados</option>
              <option value="EN_PROCESO">En Proceso</option>
              <option value="RESUELTO">Resuelto</option>
              <option value="IRREPARABLE">Irreparable</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="card-glass" style={{ padding: 0 }}>
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: "48px 24px" }}>
            <div className="empty-icon-wrapper" style={{ margin: "0 auto 16px" }}>
              <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </div>
            <h3>No se encontraron registros de soporte</h3>
            <p>Ajusta el buscador o los filtros para encontrar lo que necesitas.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Equipo TI</th>
                  <th>Descripción de la Falla</th>
                  <th>Solución / Observaciones</th>
                  <th>Técnico</th>
                  <th>Costo</th>
                  <th>Estado</th>
                  <th>Fechas (Envío / Retorno)</th>
                  <th style={{ textAlign: "right" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <Link href={`/inventario/${log.dispositivoId}`} className="font-semibold text-white hover-underline" style={{ color: "hsl(var(--primary))" }}>
                        {log.dispositivo.marca} {log.dispositivo.modelo}
                      </Link>
                      <span className="text-muted" style={{ display: "block", fontSize: "11px" }}>
                        {log.dispositivo.tipo}
                      </span>
                    </td>
                    <td>
                      <span className="text-white" style={{ fontSize: "13px", display: "inline-block", maxWidth: "250px", wordBreak: "break-word" }}>
                        {log.descripcionFalla}
                      </span>
                    </td>
                    <td>
                      <span className="text-gray" style={{ fontSize: "13px", display: "inline-block", maxWidth: "250px", wordBreak: "break-word" }}>
                        {log.solucion || "Pendiente de diagnóstico"}
                      </span>
                    </td>
                    <td>
                      <span className="text-white" style={{ fontSize: "13px" }}>
                        {log.tecnicoEncargado || "No asignado"}
                      </span>
                    </td>
                    <td>
                      <span className="font-semibold text-highlight" style={{ fontSize: "14px" }}>
                        {log.costo && log.costo > 0 ? formatCLP(log.costo) : "$0 (Garantía)"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        log.estado === "RESUELTO" ? "badge-success" : 
                        log.estado === "EN_PROCESO" ? "badge-warning" : "badge-danger"
                      }`} style={{ fontSize: "11px" }}>
                        {log.estado === "EN_PROCESO" ? "EN PROCESO" : log.estado}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", fontSize: "12px" }}>
                        <span className="text-white">Envío: {formatDate(log.fechaEnvio)}</span>
                        <span className="text-muted">Retorno: {formatDate(log.fechaRetorno)}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link href={`/inventario/${log.dispositivoId}`} className="btn btn-secondary btn-sm" style={{ padding: "4px 8px", fontSize: "12px" }}>
                        Ver Ficha
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
