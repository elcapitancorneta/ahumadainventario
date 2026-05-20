"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";

interface Device {
  id: string;
  tipo: string;
  marca: string | null;
  modelo: string | null;
  numeroSerie: string | null;
  codigoInventario: string | null;
  estado: string | null;
  detallesTecnicos: string | null;
  categoria: string | null;
  trabajadorNombre: string | null;
  ubicacion: string | null;
  fechaIngreso: Date | string;
  comentarios: string | null;
}

interface Cotizacion {
  id: string;
  cantidad: number;
  numeroParte: string | null;
  descripcion: string;
  valorUnitario: number | null;
  valorTotal: number | null;
}

interface InventarioClientProps {
  initialDevices: Device[];
  initialCotizaciones: Cotizacion[];
}

type TabType =
  | "NOTEBOOKS_CAF"
  | "PC_RECETARIO"
  | "NOTEBOOKS_MALOS"
  | "MOCHILAS"
  | "CELULARES_MALOS"
  | "CELULARES_ENTREGADOS"
  | "CARGADORES"
  | "AUDIFONOS"
  | "TECLADOS_MOUSE"
  | "ASUS"
  | "COTIZACION";

export default function InventarioClient({
  initialDevices,
  initialCotizaciones,
}: InventarioClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("NOTEBOOKS_CAF");
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("TODOS");
  const [marcaFilter, setMarcaFilter] = useState("TODOS");
  const [asignacionFilter, setAsignacionFilter] = useState("TODOS");
  const [ubicacionFilter, setUbicacionFilter] = useState("TODOS");
  const [isAdmin, setIsAdmin] = useState(false);

  // Check login status on mount
  useEffect(() => {
    fetch("/api/auth/login")
      .then((res) => res.json())
      .then((data) => setIsAdmin(data.isAdmin))
      .catch(() => {});
  }, []);

  // Tab definitions
  const tabs = [
    { id: "NOTEBOOKS_CAF", label: "Notebooks CAF", count: initialDevices.filter(d => d.categoria === "NOTEBOOKS_CAF").length },
    { id: "PC_RECETARIO", label: "PC Recetario", count: initialDevices.filter(d => d.categoria === "PC_RECETARIO").length },
    { id: "NOTEBOOKS_MALOS", label: "Notebooks Malos", count: initialDevices.filter(d => d.categoria === "NOTEBOOKS_MALOS").length },
    { id: "MOCHILAS", label: "Mochilas", count: initialDevices.filter(d => d.categoria === "MOCHILAS").length },
    { id: "CELULARES_MALOS", label: "Celulares Malos", count: initialDevices.filter(d => d.categoria === "CELULARES_MALOS").length },
    { id: "CELULARES_ENTREGADOS", label: "Celulares Entregados", count: initialDevices.filter(d => d.categoria === "CELULARES_ENTREGADOS").length },
    { id: "CARGADORES", label: "Cargadores", count: initialDevices.filter(d => d.categoria === "CARGADORES").length },
    { id: "AUDIFONOS", label: "Audífonos", count: initialDevices.filter(d => d.categoria === "AUDIFONOS").length },
    { id: "TECLADOS_MOUSE", label: "Teclados + Mouse", count: initialDevices.filter(d => d.categoria === "TECLADOS_MOUSE").length },
    { id: "ASUS", label: "Asus", count: initialDevices.filter(d => d.categoria === "ASUS").length },
    { id: "COTIZACION", label: "Cotizaciones", count: initialCotizaciones.length },
  ];

  // Helper to parse technical details JSON
  const getTechDetails = (detalles: string | null) => {
    if (!detalles) return {};
    try {
      return JSON.parse(detalles);
    } catch {
      return {};
    }
  };

  // Unique brands for the active tab category
  const availableBrands = useMemo(() => {
    if (activeTab === "COTIZACION") return [];
    const brands = initialDevices
      .filter((d) => d.categoria === activeTab && d.marca)
      .map((d) => d.marca as string);
    return Array.from(new Set(brands)).sort();
  }, [activeTab, initialDevices]);

  // Unique locations for the active tab category
  const availableLocations = useMemo(() => {
    if (activeTab === "COTIZACION") return [];
    const locs = initialDevices
      .filter((d) => d.categoria === activeTab && d.ubicacion)
      .map((d) => d.ubicacion as string);
    return Array.from(new Set(locs)).sort();
  }, [activeTab, initialDevices]);

  // Filtered lists
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    if (activeTab === "COTIZACION") {
      return initialCotizaciones.filter((c) => {
        return (
          c.descripcion.toLowerCase().includes(term) ||
          (c.numeroParte && c.numeroParte.toLowerCase().includes(term))
        );
      });
    }

    return initialDevices.filter((d) => {
      if (d.categoria !== activeTab) return false;

      // Filter by state
      if (estadoFilter !== "TODOS") {
        const stateLower = (d.estado || "").toLowerCase();
        if (estadoFilter === "NUEVO" && !["nuevo", "nueva", "operativo"].includes(stateLower)) return false;
        if (estadoFilter === "USADO" && !["usado", "usada"].includes(stateLower)) return false;
        if (estadoFilter === "MALO" && !["malo", "mal estado"].includes(stateLower)) return false;
      }

      // Filter by Brand
      if (marcaFilter !== "TODOS") {
        if (d.marca !== marcaFilter) return false;
      }

      // Filter by Location
      if (ubicacionFilter !== "TODOS") {
        if (d.ubicacion !== ubicacionFilter) return false;
      }

      // Filter by Assignment state
      if (asignacionFilter !== "TODOS") {
        const hasWorker = !!d.trabajadorNombre;
        if (asignacionFilter === "ASIGNADO" && !hasWorker) return false;
        if (asignacionFilter === "DISPONIBLE" && hasWorker) return false;
      }

      // Search term filter
      const tech = getTechDetails(d.detallesTecnicos);
      const techString = Object.values(tech).join(" ").toLowerCase();

      const matchesSearch =
        (d.marca && d.marca.toLowerCase().includes(term)) ||
        (d.modelo && d.modelo.toLowerCase().includes(term)) ||
        (d.numeroSerie && d.numeroSerie.toLowerCase().includes(term)) ||
        (d.codigoInventario && d.codigoInventario.toLowerCase().includes(term)) ||
        (d.trabajadorNombre && d.trabajadorNombre.toLowerCase().includes(term)) ||
        (d.ubicacion && d.ubicacion.toLowerCase().includes(term)) ||
        (d.comentarios && d.comentarios.toLowerCase().includes(term)) ||
        techString.includes(term);

      return matchesSearch;
    });
  }, [
    activeTab,
    searchTerm,
    estadoFilter,
    marcaFilter,
    asignacionFilter,
    ubicacionFilter,
    initialDevices,
    initialCotizaciones,
  ]);

  // Handle Delete device
  const handleDelete = async (id: string, label: string) => {
    if (confirm(`¿Estás completamente seguro de que deseas eliminar el equipo "${label}"?\nEsta acción no se puede deshacer.`)) {
      try {
        const res = await fetch(`/api/inventario/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          alert("Dispositivo eliminado exitosamente.");
          window.location.reload();
        } else {
          const err = await res.json();
          alert(`Error: ${err.error || "No se pudo eliminar el equipo"}`);
        }
      } catch {
        alert("Error de conexión al eliminar el equipo.");
      }
    }
  };

  // Helper to format currency
  const formatUSD = (val: number | null) => {
    if (val === null || val === undefined) return "-";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
  };

  return (
    <div className="inventario-content">
      {/* Header */}
      <header className="page-header">
        <div>
          <span className="page-subtitle">Inventario de Equipamiento</span>
          <h1 className="page-title">Farmacias Ahumada</h1>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {isAdmin && activeTab !== "COTIZACION" && (
            <Link href={`/inventario/nuevo?categoria=${activeTab}`} className="btn btn-primary btn-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14, marginRight: 6 }}>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Agregar Equipo
            </Link>
          )}
          <div className="card-glass mini-stat" style={{ padding: "8px 16px" }}>
            <span className="stat-label">Registros Totales</span>
            <span className="stat-value" style={{ fontSize: "18px" }}>
              {initialDevices.length + initialCotizaciones.length}
            </span>
          </div>
        </div>
      </header>

      {/* Tabs list */}
      <div className="tabs-container card-glass">
        <div className="tabs-scroll">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab.id as TabType);
                setSearchTerm("");
                setEstadoFilter("TODOS");
                setMarcaFilter("TODOS");
                setAsignacionFilter("TODOS");
                setUbicacionFilter("TODOS");
              }}
            >
              <span className="tab-label">{tab.label}</span>
              <span className="tab-badge">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters Bar */}
      <section className="filters-bar card-glass">
        <div className="search-box">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por marca, modelo, N/S, asignado u observaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm("")}>
              ✕
            </button>
          )}
        </div>

        {activeTab !== "COTIZACION" && (
          <div className="select-filters">
            {/* Estado filter */}
            <div className="filter-group">
              <label>Estado:</label>
              <select value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)}>
                <option value="TODOS">Todos</option>
                <option value="NUEVO">Nuevos / Operativos</option>
                <option value="USADO">Usados</option>
                <option value="MALO">Malo / De Baja</option>
              </select>
            </div>

            {/* Marca filter */}
            {availableBrands.length > 0 && (
              <div className="filter-group">
                <label>Marca:</label>
                <select value={marcaFilter} onChange={(e) => setMarcaFilter(e.target.value)}>
                  <option value="TODOS">Todas</option>
                  {availableBrands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Asignación filter */}
            <div className="filter-group">
              <label>Asignación:</label>
              <select value={asignacionFilter} onChange={(e) => setAsignacionFilter(e.target.value)}>
                <option value="TODOS">Todos</option>
                <option value="ASIGNADO">Asignados</option>
                <option value="DISPONIBLE">En Bodega (Libres)</option>
              </select>
            </div>

            {/* Ubicación filter */}
            {availableLocations.length > 0 && (
              <div className="filter-group">
                <label>Ubicación:</label>
                <select value={ubicacionFilter} onChange={(e) => setUbicacionFilter(e.target.value)}>
                  <option value="TODOS">Todas</option>
                  {availableLocations.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Results Count */}
      <div className="results-count">
        Mostrando {filteredData.length} registros encontrados
      </div>

      {/* Dynamic Data Table */}
      <div className="table-responsive card-glass">
        {filteredData.length === 0 ? (
          <div className="empty-state" style={{ padding: "40px 20px", textAlign: "center" }}>
            <div className="empty-icon-wrapper orange" style={{ margin: "0 auto 12px" }}>
              <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3>No se encontraron resultados</h3>
            <p>Intenta cambiar la búsqueda o restablecer los filtros avanzados.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              {/* Dynamic Headers based on category */}
              {activeTab === "NOTEBOOKS_CAF" && (
                <tr>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Número de Serie</th>
                  <th>Nombre Equipo</th>
                  <th>Estado</th>
                  <th>Usuario</th>
                  <th>Área</th>
                  <th>Ubicación</th>
                  <th>Trabajando</th>
                  <th style={{ width: isAdmin ? "200px" : "120px" }}>Acciones</th>
                </tr>
              )}
              {activeTab === "PC_RECETARIO" && (
                <tr>
                  <th>Marca</th>
                  <th>Nombre Equipo</th>
                  <th>Número de Serie</th>
                  <th>Sección</th>
                  <th>Estado</th>
                  <th>Ubicación</th>
                  <th style={{ width: isAdmin ? "200px" : "120px" }}>Acciones</th>
                </tr>
              )}
              {activeTab === "NOTEBOOKS_MALOS" && (
                <tr>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Número de Serie</th>
                  <th>Condición</th>
                  <th>Faltantes</th>
                  <th>Estado Estético</th>
                  <th>Observaciones</th>
                  <th style={{ width: isAdmin ? "200px" : "120px" }}>Acciones</th>
                </tr>
              )}
              {activeTab === "MOCHILAS" && (
                <tr>
                  <th>Marca</th>
                  <th>Estado</th>
                  <th>Asignado a</th>
                  <th>Área</th>
                  <th>Fecha Entrega</th>
                  <th>Cantidad</th>
                  <th style={{ width: isAdmin ? "200px" : "120px" }}>Acciones</th>
                </tr>
              )}
              {activeTab === "CELULARES_MALOS" && (
                <tr>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Número de Serie</th>
                  <th>Condición</th>
                  <th>Faltantes</th>
                  <th>Estado Estético</th>
                  <th>Observaciones</th>
                  <th style={{ width: isAdmin ? "200px" : "120px" }}>Acciones</th>
                </tr>
              )}
              {activeTab === "CELULARES_ENTREGADOS" && (
                <tr>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Número</th>
                  <th>Condición CHIP</th>
                  <th>Faltantes</th>
                  <th>Estado Estético</th>
                  <th>Asignado a</th>
                  <th>IMEI</th>
                  <th style={{ width: isAdmin ? "200px" : "120px" }}>Acciones</th>
                </tr>
              )}
              {activeTab === "CARGADORES" && (
                <tr>
                  <th>Modelo (Marca)</th>
                  <th>Número de Serie</th>
                  <th>Condición</th>
                  <th>Faltantes</th>
                  <th>Estado Estético</th>
                  <th>Asignado a</th>
                  <th>Observaciones</th>
                  <th style={{ width: isAdmin ? "200px" : "120px" }}>Acciones</th>
                </tr>
              )}
              {activeTab === "AUDIFONOS" && (
                <tr>
                  <th>Modelo</th>
                  <th>Número de Serie</th>
                  <th>Condición</th>
                  <th>Faltantes</th>
                  <th>Estado Estético</th>
                  <th>Asignado a</th>
                  <th>Observaciones</th>
                  <th style={{ width: isAdmin ? "200px" : "120px" }}>Acciones</th>
                </tr>
              )}
              {activeTab === "TECLADOS_MOUSE" && (
                <tr>
                  <th>Marca</th>
                  <th>Estado</th>
                  <th>Asignado a</th>
                  <th>Área</th>
                  <th>Cantidad</th>
                  <th style={{ width: isAdmin ? "200px" : "120px" }}>Acciones</th>
                </tr>
              )}
              {activeTab === "ASUS" && (
                <tr>
                  <th>Código Interno</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Memoria RAM</th>
                  <th>Disco</th>
                  <th>Estado</th>
                  <th style={{ width: isAdmin ? "200px" : "120px" }}>Acciones</th>
                </tr>
              )}
              {activeTab === "COTIZACION" && (
                <tr>
                  <th>Cant.</th>
                  <th>Part Number</th>
                  <th>Descripción</th>
                  <th>Val. Unitario (USD)</th>
                  <th>Total (USD)</th>
                </tr>
              )}
            </thead>
            <tbody>
              {/* Dynamic Rows */}
              {activeTab === "NOTEBOOKS_CAF" &&
                (filteredData as Device[]).map((d) => {
                  const tech = getTechDetails(d.detallesTecnicos);
                  return (
                    <tr key={d.id}>
                      <td className="font-bold">{d.marca}</td>
                      <td>{d.modelo}</td>
                      <td className="code-text">{d.numeroSerie || "-"}</td>
                      <td className="code-text">{tech.nombreEquipo || "-"}</td>
                      <td>
                        <span className={`badge badge-${(d.estado || "operativo").toLowerCase().replace(" ", "_")}`}>
                          {d.estado || "OPERATIVO"}
                        </span>
                      </td>
                      <td>{d.trabajadorNombre || "-"}</td>
                      <td>{tech.area || "-"}</td>
                      <td>{d.ubicacion || "-"}</td>
                      <td>
                        <span className={`status-pill ${tech.trabajando === "SI" ? "active" : "inactive"}`}>
                          {tech.trabajando || "-"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <Link href={`/inventario/${d.id}`} className="action-btn-view">
                            Ver
                          </Link>
                          {isAdmin && (
                            <>
                              <Link href={`/inventario/${d.id}/editar`} className="action-btn-view" style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "white" }}>
                                Editar
                              </Link>
                              <button onClick={() => handleDelete(d.id, `${d.marca || "Dispositivo"} ${d.modelo || ""}`)} className="action-btn-view" style={{ backgroundColor: "rgba(220,53,69,0.15)", color: "rgb(220,53,69)" }}>
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {activeTab === "PC_RECETARIO" &&
                (filteredData as Device[]).map((d) => {
                  const tech = getTechDetails(d.detallesTecnicos);
                  return (
                    <tr key={d.id}>
                      <td className="font-bold">{d.marca}</td>
                      <td className="code-text">{tech.nombreEquipo || "-"}</td>
                      <td className="code-text">{d.numeroSerie || "-"}</td>
                      <td>{tech.seccion || "-"}</td>
                      <td>
                        <span className={`badge badge-${(d.estado || "nuevo").toLowerCase().replace(" ", "_")}`}>
                          {d.estado || "NUEVO"}
                        </span>
                      </td>
                      <td>{d.ubicacion || "-"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <Link href={`/inventario/${d.id}`} className="action-btn-view">
                            Ver
                          </Link>
                          {isAdmin && (
                            <>
                              <Link href={`/inventario/${d.id}/editar`} className="action-btn-view" style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "white" }}>
                                Editar
                              </Link>
                              <button onClick={() => handleDelete(d.id, `${d.marca || "Dispositivo"} ${d.modelo || ""}`)} className="action-btn-view" style={{ backgroundColor: "rgba(220,53,69,0.15)", color: "rgb(220,53,69)" }}>
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {activeTab === "NOTEBOOKS_MALOS" &&
                (filteredData as Device[]).map((d) => {
                  const tech = getTechDetails(d.detallesTecnicos);
                  return (
                    <tr key={d.id}>
                      <td className="font-bold">{d.marca}</td>
                      <td>{d.modelo}</td>
                      <td className="code-text">{d.numeroSerie || "-"}</td>
                      <td className="text-red font-semibold">{tech.condicion || "Mal estado"}</td>
                      <td>{tech.articulosFaltantes || "-"}</td>
                      <td>{tech.estadoEstetico || "-"}</td>
                      <td className="small-text text-gray">{d.comentarios || "-"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <Link href={`/inventario/${d.id}`} className="action-btn-view">
                            Ficha
                          </Link>
                          {isAdmin && (
                            <>
                              <Link href={`/inventario/${d.id}/editar`} className="action-btn-view" style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "white" }}>
                                Editar
                              </Link>
                              <button onClick={() => handleDelete(d.id, `${d.marca || "Dispositivo"} ${d.modelo || ""}`)} className="action-btn-view" style={{ backgroundColor: "rgba(220,53,69,0.15)", color: "rgb(220,53,69)" }}>
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {activeTab === "MOCHILAS" &&
                (filteredData as Device[]).map((d) => {
                  const tech = getTechDetails(d.detallesTecnicos);
                  return (
                    <tr key={d.id}>
                      <td className="font-bold">{d.marca}</td>
                      <td>
                        <span className={`badge badge-${(d.estado || "nueva").toLowerCase().trim()}`}>
                          {d.estado}
                        </span>
                      </td>
                      <td>{d.trabajadorNombre || "-"}</td>
                      <td>{tech.area || "-"}</td>
                      <td>{tech.fechaEntrega || "-"}</td>
                      <td className="font-bold">{tech.cantidad || 1}</td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <Link href={`/inventario/${d.id}`} className="action-btn-view">
                            Ver
                          </Link>
                          {isAdmin && (
                            <>
                              <Link href={`/inventario/${d.id}/editar`} className="action-btn-view" style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "white" }}>
                                Editar
                              </Link>
                              <button onClick={() => handleDelete(d.id, `${d.marca || "Dispositivo"}`)} className="action-btn-view" style={{ backgroundColor: "rgba(220,53,69,0.15)", color: "rgb(220,53,69)" }}>
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {activeTab === "CELULARES_MALOS" &&
                (filteredData as Device[]).map((d) => {
                  const tech = getTechDetails(d.detallesTecnicos);
                  return (
                    <tr key={d.id}>
                      <td className="font-bold">{d.marca}</td>
                      <td>{d.modelo}</td>
                      <td className="code-text">{d.numeroSerie || "-"}</td>
                      <td className="text-red font-semibold">{tech.condicion || "Mal estado"}</td>
                      <td>{tech.articulosFaltantes || "-"}</td>
                      <td>{tech.estadoEstetico || "-"}</td>
                      <td className="small-text text-gray">{d.comentarios || "-"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <Link href={`/inventario/${d.id}`} className="action-btn-view">
                            Ficha
                          </Link>
                          {isAdmin && (
                            <>
                              <Link href={`/inventario/${d.id}/editar`} className="action-btn-view" style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "white" }}>
                                Editar
                              </Link>
                              <button onClick={() => handleDelete(d.id, `${d.marca || "Celular"} ${d.modelo || ""}`)} className="action-btn-view" style={{ backgroundColor: "rgba(220,53,69,0.15)", color: "rgb(220,53,69)" }}>
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {activeTab === "CELULARES_ENTREGADOS" &&
                (filteredData as Device[]).map((d) => {
                  const tech = getTechDetails(d.detallesTecnicos);
                  return (
                    <tr key={d.id}>
                      <td className="font-bold">{d.marca}</td>
                      <td>{d.modelo}</td>
                      <td className="font-bold code-text">{tech.numero || "-"}</td>
                      <td>
                        <span className="chip-status-pill">{tech.condicionChip || "-"}</span>
                      </td>
                      <td>{tech.articulosFaltantes || "-"}</td>
                      <td>{tech.estadoEstetico || "-"}</td>
                      <td>{d.trabajadorNombre || "-"}</td>
                      <td className="code-text small-text">{tech.imei || "-"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <Link href={`/inventario/${d.id}`} className="action-btn-view">
                            Ver
                          </Link>
                          {isAdmin && (
                            <>
                              <Link href={`/inventario/${d.id}/editar`} className="action-btn-view" style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "white" }}>
                                Editar
                              </Link>
                              <button onClick={() => handleDelete(d.id, `${d.marca || "Celular"} ${d.modelo || ""}`)} className="action-btn-view" style={{ backgroundColor: "rgba(220,53,69,0.15)", color: "rgb(220,53,69)" }}>
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {activeTab === "CARGADORES" &&
                (filteredData as Device[]).map((d) => {
                  const tech = getTechDetails(d.detallesTecnicos);
                  return (
                    <tr key={d.id}>
                      <td className="font-bold">{d.modelo}</td>
                      <td className="code-text">{d.numeroSerie || "-"}</td>
                      <td>
                        <span className={`badge badge-${(d.estado || "nuevo").toLowerCase().trim()}`}>
                          {d.estado || "NUEVO"}
                        </span>
                      </td>
                      <td>{tech.articulosFaltantes || "-"}</td>
                      <td>{tech.estadoEstetico || "-"}</td>
                      <td>{d.trabajadorNombre || "-"}</td>
                      <td className="small-text text-gray">{d.comentarios || "-"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <Link href={`/inventario/${d.id}`} className="action-btn-view">
                            Ver
                          </Link>
                          {isAdmin && (
                            <>
                              <Link href={`/inventario/${d.id}/editar`} className="action-btn-view" style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "white" }}>
                                Editar
                              </Link>
                              <button onClick={() => handleDelete(d.id, `Cargador ${d.modelo || ""}`)} className="action-btn-view" style={{ backgroundColor: "rgba(220,53,69,0.15)", color: "rgb(220,53,69)" }}>
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {activeTab === "AUDIFONOS" &&
                (filteredData as Device[]).map((d) => {
                  const tech = getTechDetails(d.detallesTecnicos);
                  return (
                    <tr key={d.id}>
                      <td className="font-bold">{d.modelo}</td>
                      <td className="code-text">{d.numeroSerie || "-"}</td>
                      <td>
                        <span className={`badge badge-${(d.estado || "nuevo").toLowerCase().trim()}`}>
                          {d.estado || "NUEVO"}
                        </span>
                      </td>
                      <td>{tech.articulosFaltantes || "-"}</td>
                      <td>{tech.estadoEstetico || "-"}</td>
                      <td>{d.trabajadorNombre || "-"}</td>
                      <td className="small-text text-gray">
                        {d.comentarios || "-"} {tech.extra ? `[${tech.extra}]` : ""}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <Link href={`/inventario/${d.id}`} className="action-btn-view">
                            Ver
                          </Link>
                          {isAdmin && (
                            <>
                              <Link href={`/inventario/${d.id}/editar`} className="action-btn-view" style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "white" }}>
                                Editar
                              </Link>
                              <button onClick={() => handleDelete(d.id, `Audífonos ${d.modelo || ""}`)} className="action-btn-view" style={{ backgroundColor: "rgba(220,53,69,0.15)", color: "rgb(220,53,69)" }}>
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {activeTab === "TECLADOS_MOUSE" &&
                (filteredData as Device[]).map((d) => {
                  const tech = getTechDetails(d.detallesTecnicos);
                  return (
                    <tr key={d.id}>
                      <td className="font-bold">{d.marca}</td>
                      <td>
                        <span className={`badge badge-${(d.estado || "nuevo").toLowerCase().trim()}`}>
                          {d.estado}
                        </span>
                      </td>
                      <td>{d.trabajadorNombre || "-"}</td>
                      <td>{tech.area || "-"}</td>
                      <td className="font-bold">{tech.cantidad || 1}</td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <Link href={`/inventario/${d.id}`} className="action-btn-view">
                            Ver
                          </Link>
                          {isAdmin && (
                            <>
                              <Link href={`/inventario/${d.id}/editar`} className="action-btn-view" style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "white" }}>
                                Editar
                              </Link>
                              <button onClick={() => handleDelete(d.id, `Accesorios ${d.marca || ""}`)} className="action-btn-view" style={{ backgroundColor: "rgba(220,53,69,0.15)", color: "rgb(220,53,69)" }}>
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {activeTab === "ASUS" &&
                (filteredData as Device[]).map((d) => {
                  const tech = getTechDetails(d.detallesTecnicos);
                  return (
                    <tr key={d.id}>
                      <td className="code-text font-bold">{d.codigoInventario || "-"}</td>
                      <td>{d.marca}</td>
                      <td>{d.modelo}</td>
                      <td>{tech.memoria || "-"}</td>
                      <td>{tech.disco || "-"}</td>
                      <td>
                        <span className={`badge badge-${(d.estado || "nuevo").toLowerCase().trim()}`}>
                          {d.estado}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <Link href={`/inventario/${d.id}`} className="action-btn-view">
                            Ver
                          </Link>
                          {isAdmin && (
                            <>
                              <Link href={`/inventario/${d.id}/editar`} className="action-btn-view" style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "white" }}>
                                Editar
                              </Link>
                              <button onClick={() => handleDelete(d.id, `Asus ${d.codigoInventario || ""}`)} className="action-btn-view" style={{ backgroundColor: "rgba(220,53,69,0.15)", color: "rgb(220,53,69)" }}>
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {activeTab === "COTIZACION" &&
                (filteredData as Cotizacion[]).map((c) => (
                  <tr key={c.id}>
                    <td className="font-bold">{c.cantidad}</td>
                    <td className="code-text">{c.numeroParte || "-"}</td>
                    <td>{c.descripcion}</td>
                    <td className="font-mono text-green">{formatUSD(c.valorUnitario)}</td>
                    <td className="font-mono text-green font-bold">{formatUSD(c.valorTotal)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
