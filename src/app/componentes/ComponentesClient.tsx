"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ComponentItem {
  id: string;
  nombre: string;
  tipo: string;
  cantidadDisponible: number;
  ubicacion: string;
}

interface ComponentesClientProps {
  initialComponents: ComponentItem[];
  isAdmin: boolean;
}

export default function ComponentesClient({ initialComponents, isAdmin }: ComponentesClientProps) {
  const router = useRouter();
  const [components, setComponents] = useState<ComponentItem[]>(initialComponents);
  const [search, setSearch] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("TODOS");

  // Modal control
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("RAM");
  const [cantidad, setCantidad] = useState("0");
  const [ubicacion, setUbicacion] = useState("Bodega Central");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Compute metrics
  const totalItems = components.length;
  const totalStock = components.reduce((sum, item) => sum + item.cantidadDisponible, 0);
  const uniqueTypes = Array.from(new Set(components.map((c) => c.tipo)));

  // Filter components
  const filtered = components.filter((comp) => {
    const matchesSearch = comp.nombre.toLowerCase().includes(search.toLowerCase()) || 
                          comp.tipo.toLowerCase().includes(search.toLowerCase()) ||
                          comp.ubicacion.toLowerCase().includes(search.toLowerCase());
    const matchesTipo = selectedTipo === "TODOS" || comp.tipo === selectedTipo;
    return matchesSearch && matchesTipo;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setNombre("");
    setTipo("RAM");
    setCantidad("0");
    setUbicacion("Bodega Central");
    setError("");
    setShowModal(true);
  };

  const handleOpenEdit = (comp: ComponentItem) => {
    setEditingId(comp.id);
    setNombre(comp.nombre);
    setTipo(comp.tipo);
    setCantidad(comp.cantidadDisponible.toString());
    setUbicacion(comp.ubicacion);
    setError("");
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar "${name}"?\nEsta acción no se puede deshacer.`)) {
      try {
        const res = await fetch(`/api/componentes/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          setComponents(components.filter((c) => c.id !== id));
          router.refresh();
        } else {
          alert("Error al eliminar el componente.");
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
      tipo,
      cantidadDisponible: parseInt(cantidad, 10),
      ubicacion,
    };

    const url = editingId ? `/api/componentes/${editingId}` : "/api/componentes";
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
        // Refresh local state or refresh the page
        if (editingId) {
          setComponents(components.map((c) => (c.id === editingId ? data.component : c)));
        } else {
          setComponents([...components, data.component]);
        }
        router.refresh();
      } else {
        setError(data.error || "Ocurrió un error al guardar.");
      }
    } catch {
      setError("Error de red al guardar el componente.");
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
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            Stock de Componentes y Repuestos
          </h1>
          <p className="page-subtitle">Bodega de hardware y periféricos para mantenimiento TI</p>
        </div>

        {isAdmin && (
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16, marginRight: 8 }}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Agregar Componente
          </button>
        )}
      </header>

      {/* Metrics Row */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="card-glass metric-card">
          <span className="metric-label">Componentes Únicos</span>
          <span className="metric-value">{totalItems}</span>
        </div>
        <div className="card-glass metric-card">
          <span className="metric-label">Total Repuestos en Stock</span>
          <span className="metric-value text-highlight">{totalStock}</span>
        </div>
        <div className="card-glass metric-card">
          <span className="metric-label">Tipos de Repuestos</span>
          <span className="metric-value">{uniqueTypes.length}</span>
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
            placeholder="Buscar componentes por nombre o bodega..."
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
            <label htmlFor="comp-type-filter">Tipo:</label>
            <select
              id="comp-type-filter"
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
            >
              <option value="TODOS">Todos los tipos</option>
              {uniqueTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
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
            <h3>No se encontraron componentes</h3>
            <p>Ajusta el buscador o los filtros para encontrar lo que buscas.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre del Repuesto</th>
                  <th>Tipo</th>
                  <th>Cantidad Disponible</th>
                  <th>Ubicación / Bodega</th>
                  {isAdmin && <th style={{ textAlign: "right" }}>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((comp) => (
                  <tr key={comp.id}>
                    <td>
                      <span className="font-semibold text-white">{comp.nombre}</span>
                    </td>
                    <td>
                      <span className="code-text">{comp.tipo}</span>
                    </td>
                    <td>
                      <span
                        className={`font-bold ${
                          comp.cantidadDisponible <= 5 ? "text-red" : "text-highlight"
                        }`}
                        style={{ fontSize: "16px" }}
                      >
                        {comp.cantidadDisponible} unidades
                        {comp.cantidadDisponible <= 5 && " (Stock Bajo)"}
                      </span>
                    </td>
                    <td>
                      <span className="text-gray">{comp.ubicacion}</span>
                    </td>
                    {isAdmin && (
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          <button
                            onClick={() => handleOpenEdit(comp)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: "4px 8px", fontSize: "12px" }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(comp.id, comp.nombre)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: "4px 8px", fontSize: "12px" }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    )}
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
              maxWidth: "480px",
              width: "100%",
              padding: "32px",
              border: "1px solid hsl(var(--primary) / 0.3)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.8)",
            }}
          >
            <h2 className="card-title" style={{ marginBottom: "8px" }}>
              {editingId ? "Editar Componente / Repuesto" : "Agregar Componente"}
            </h2>
            <p style={{ fontSize: "14px", color: "hsl(var(--text-secondary))", marginBottom: "24px" }}>
              Registra componentes para el stock de soporte técnico.
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
                <label htmlFor="comp-nombre">Nombre del Componente</label>
                <input
                  id="comp-nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="ej. Memoria RAM DDR4 8GB Crucial"
                  required
                />
              </div>

              <div className="tech-specs-grid" style={{ gap: "16px" }}>
                <div className="spec-item">
                  <label htmlFor="comp-tipo">Tipo</label>
                  <select
                    id="comp-tipo"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                  >
                    <option value="RAM">Memoria RAM</option>
                    <option value="Almacenamiento">Almacenamiento (SSD/HDD)</option>
                    <option value="Periférico">Periférico</option>
                    <option value="Cargador">Cargador</option>
                    <option value="Adaptador">Adaptador</option>
                    <option value="Redes">Redes / Conectividad</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div className="spec-item">
                  <label htmlFor="comp-cantidad">Stock Inicial</label>
                  <input
                    id="comp-cantidad"
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="comp-ubicacion">Ubicación / Bodega</label>
                <input
                  id="comp-ubicacion"
                  type="text"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  placeholder="ej. Bodega Central, Bodega Recetario"
                  required
                />
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
                  {loading ? "Guardando..." : "Guardar Componente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
