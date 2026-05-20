"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DeviceSummary {
  id: string;
  tipo: string;
  marca: string | null;
  modelo: string | null;
}

interface Worker {
  id: string;
  nombre: string;
  rut: string;
  cargo: string;
  departamento: string;
  correo: string;
  dispositivos: DeviceSummary[];
}

interface TrabajadoresClientProps {
  initialWorkers: Worker[];
  isAdmin: boolean;
}

export default function TrabajadoresClient({ initialWorkers, isAdmin }: TrabajadoresClientProps) {
  const router = useRouter();
  const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("TODOS");

  // Modal control
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [rut, setRut] = useState("");
  const [cargo, setCargo] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Compute metrics
  const totalWorkers = workers.length;
  const workersWithDevices = workers.filter((w) => w.dispositivos.length > 0).length;
  const uniqueDepts = Array.from(new Set(workers.map((w) => w.departamento)));

  // Filter workers
  const filtered = workers.filter((w) => {
    const matchesSearch = w.nombre.toLowerCase().includes(search.toLowerCase()) ||
                          w.rut.toLowerCase().includes(search.toLowerCase()) ||
                          w.cargo.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === "TODOS" || w.departamento === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setNombre("");
    setRut("");
    setCargo("");
    setDepartamento("");
    setCorreo("");
    setError("");
    setShowModal(true);
  };

  const handleOpenEdit = (w: Worker) => {
    setEditingId(w.id);
    setNombre(w.nombre);
    setRut(w.rut);
    setCargo(w.cargo);
    setDepartamento(w.departamento);
    setCorreo(w.correo);
    setError("");
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar a "${name}"?\nSe desvincularán automáticamente todos sus dispositivos.`)) {
      try {
        const res = await fetch(`/api/trabajadores/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          setWorkers(workers.filter((w) => w.id !== id));
          router.refresh();
        } else {
          alert("Error al eliminar el trabajador.");
        }
      } catch {
        alert("Error de conexión al eliminar.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      nombre,
      rut,
      cargo,
      departamento,
      correo,
    };

    const url = editingId ? `/api/trabajadores/${editingId}` : "/api/trabajadores";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setShowModal(false);
        if (editingId) {
          setWorkers(workers.map((w) => (w.id === editingId ? { ...w, ...data.worker } : w)));
        } else {
          setWorkers([...workers, { ...data.worker, dispositivos: [] }]);
        }
        router.refresh();
      } else {
        setError(data.error || "Ocurrió un error al guardar.");
      }
    } catch {
      setError("Error de red al guardar el trabajador.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inventario-content">
      {/* Header */}
      <header className="page-header">
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 28, height: 28, color: "hsl(var(--primary))" }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Directorio de Trabajadores
          </h1>
          <p className="page-subtitle">Asignación de equipos y personal TI de Farmacias Ahumada</p>
        </div>

        {isAdmin && (
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16, marginRight: 8 }}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Registrar Trabajador
          </button>
        )}
      </header>

      {/* Metrics Row */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="card-glass metric-card">
          <span className="metric-label">Total Colaboradores</span>
          <span className="metric-value">{totalWorkers}</span>
        </div>
        <div className="card-glass metric-card">
          <span className="metric-label">Con Dispositivos Asignados</span>
          <span className="metric-value text-highlight">
            {workersWithDevices} <span style={{ fontSize: "14px", fontWeight: "normal" }}>({Math.round((workersWithDevices / (totalWorkers || 1)) * 100)}%)</span>
          </span>
        </div>
        <div className="card-glass metric-card">
          <span className="metric-label">Departamentos Activos</span>
          <span className="metric-value">{uniqueDepts.length}</span>
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
            placeholder="Buscar por nombre, RUT, cargo..."
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
            <label htmlFor="dept-filter">Departamento:</label>
            <select
              id="dept-filter"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="TODOS">Todos los departamentos</option>
              {uniqueDepts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
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
            <h3>No se encontraron colaboradores</h3>
            <p>Prueba buscando con otros términos.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>RUT</th>
                  <th>Cargo / Área</th>
                  <th>Correo</th>
                  <th>Equipos Asignados</th>
                  <th style={{ textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((w) => (
                  <tr key={w.id}>
                    <td>
                      <Link href={`/trabajadores/${w.id}`} className="font-semibold text-white hover-underline" style={{ color: "hsl(var(--primary))" }}>
                        {w.nombre}
                      </Link>
                    </td>
                    <td>
                      <span className="code-text" style={{ fontSize: "12px" }}>{w.rut}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span className="text-white" style={{ fontSize: "14px" }}>{w.cargo}</span>
                        <span className="text-muted" style={{ fontSize: "12px" }}>{w.departamento}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-gray" style={{ fontSize: "13px" }}>{w.correo}</span>
                    </td>
                    <td>
                      {w.dispositivos.length === 0 ? (
                        <span className="badge badge-warning" style={{ fontSize: "11px" }}>Sin equipos</span>
                      ) : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {w.dispositivos.map((dev) => (
                            <Link
                              key={dev.id}
                              href={`/inventario/${dev.id}`}
                              className="badge badge-success hover-scale"
                              style={{ textDecoration: "none", fontSize: "11px" }}
                              title={`${dev.marca} ${dev.modelo}`}
                            >
                              {dev.tipo}
                            </Link>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <Link href={`/trabajadores/${w.id}`} className="btn btn-secondary btn-sm" style={{ padding: "4px 8px", fontSize: "12px" }}>
                          Ficha
                        </Link>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(w)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: "4px 8px", fontSize: "12px" }}
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(w.id, w.nombre)}
                              className="btn btn-danger btn-sm"
                              style={{ padding: "4px 8px", fontSize: "12px" }}
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Glassmorphic Add/Edit Modal */}
      {showModal && (
        <div
          className="modal-overlay animate-fade-in"
          style={{
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
            padding: "20px",
          }}
        >
          <div
            className="card-glass content-card"
            style={{
              maxWidth: "500px",
              width: "100%",
              padding: "32px",
              border: "1px solid hsl(var(--primary) / 0.3)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.8)",
            }}
          >
            <h2 className="card-title" style={{ marginBottom: "8px" }}>
              {editingId ? "Editar Ficha de Colaborador" : "Registrar Colaborador"}
            </h2>
            <p style={{ fontSize: "14px", color: "hsl(var(--text-secondary))", marginBottom: "24px" }}>
              Introduce los datos personales y contractuales básicos.
            </p>

            {error && (
              <div
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: "hsl(var(--danger-bg))",
                  border: "1px solid hsl(var(--danger) / 0.3)",
                  color: "hsl(var(--danger))",
                  fontWeight: 600,
                  fontSize: "14px",
                  marginBottom: "16px",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label htmlFor="w-nombre">Nombre Completo</label>
                <input
                  id="w-nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="ej. Diego Navarro"
                  required
                />
              </div>

              <div className="tech-specs-grid" style={{ gap: "16px" }}>
                <div className="spec-item">
                  <label htmlFor="w-rut">RUT</label>
                  <input
                    id="w-rut"
                    type="text"
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
                    placeholder="ej. 12.345.678-9"
                    required
                  />
                </div>

                <div className="spec-item">
                  <label htmlFor="w-correo">Correo Electrónico</label>
                  <input
                    id="w-correo"
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="ej. diego.navarro@farmaciasahumada.cl"
                    required
                  />
                </div>
              </div>

              <div className="tech-specs-grid" style={{ gap: "16px" }}>
                <div className="spec-item">
                  <label htmlFor="w-cargo">Cargo</label>
                  <input
                    id="w-cargo"
                    type="text"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    placeholder="ej. Soporte TI"
                    required
                  />
                </div>

                <div className="spec-item">
                  <label htmlFor="w-dept">Departamento</label>
                  <input
                    id="w-dept"
                    type="text"
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                    placeholder="ej. Operaciones TI"
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "12px" }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                  {loading ? "Guardando..." : "Guardar Colaborador"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
