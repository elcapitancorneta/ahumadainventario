import prisma from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 0; // Force dynamic rendering for real-time updates

export default async function DashboardPage() {
  // Query DB data
  const devices = await prisma.dispositivo.findMany({
    include: { trabajador: true },
  });

  const components = await prisma.componente.findMany();

  const recentRepairs = await prisma.historialReparacion.findMany({
    include: { dispositivo: true },
    orderBy: { fechaEnvio: "desc" },
    take: 5,
  });

  // Totals calculations
  const totalDevices = devices.length;
  // If assigned to a worker and not bad, it's active
  const inService = devices.filter((d) => d.trabajadorNombre && d.estado !== "MALO").length;
  // If not assigned and not bad, it's in stock
  const inStock = devices.filter((d) => !d.trabajadorNombre && d.estado !== "MALO").length;
  // If bad, it's out of service / in repair
  const inRepair = devices.filter((d) => d.estado === "MALO" || d.estado === "REPARACION").length;

  // Group by category
  const pcCount = devices.filter((d) => d.tipo === "NOTEBOOK" || d.tipo === "DESKTOP" || d.tipo === "COMPUTADOR" || d.tipo === "ESCRITORIO").length;
  const phoneCount = devices.filter((d) => d.tipo === "CELULAR" || d.tipo === "TELEFONO").length;
  const accessoryCount = devices.filter((d) => d.tipo === "ACCESORIO").length;
  const monitorCount = devices.filter((d) => d.tipo === "MONITOR").length;
  const printerCount = devices.filter((d) => d.tipo === "IMPRESORA").length;

  // Components alerts
  const lowStockComponents = components.filter((c) => c.cantidadDisponible < 5);

  return (
    <div className="dashboard-wrapper animate-fade-in">
      {/* Header */}
      <header className="page-header">
        <div>
          <span className="page-subtitle">Panel Central</span>
          <h1 className="page-title">Dashboard General</h1>
        </div>
        <div className="header-date">
          <svg className="date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{new Date().toLocaleDateString("es-CL", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </header>

      {/* Metrics Grid */}
      <section className="metrics-grid">
        <div className="card-glass metric-card">
          <div className="metric-header">
            <span className="metric-label">Total Equipos</span>
            <div className="metric-icon-wrapper blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
          </div>
          <div className="metric-value">{totalDevices}</div>
          <div className="metric-footer">Equipos registrados en el sistema</div>
        </div>

        <div className="card-glass metric-card">
          <div className="metric-header">
            <span className="metric-label">Operativos</span>
            <div className="metric-icon-wrapper green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <div className="metric-value">{inService}</div>
          <div className="metric-footer green-text">
            {totalDevices > 0 ? Math.round((inService / totalDevices) * 100) : 0}% de disponibilidad activa
          </div>
        </div>

        <div className="card-glass metric-card">
          <div className="metric-header">
            <span className="metric-label">En Bodega</span>
            <div className="metric-icon-wrapper purple">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </div>
          </div>
          <div className="metric-value">{inStock}</div>
          <div className="metric-footer">Equipamiento disponible para asignar</div>
        </div>

        <div className="card-glass metric-card">
          <div className="metric-header">
            <span className="metric-label">En Reparación</span>
            <div className="metric-icon-wrapper orange">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
          </div>
          <div className="metric-value">{inRepair}</div>
          <div className="metric-footer orange-text">Requieren mantenimiento o servicio</div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-column">
          {/* Category Distribution */}
          <div className="card-glass content-card">
            <h2 className="card-title">Distribución de Dispositivos</h2>
            <div className="distribution-list">
              <div className="dist-item">
                <div className="dist-meta">
                  <span className="dist-name">Computadores</span>
                  <span className="dist-count">{pcCount}</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill red" style={{ width: `${totalDevices > 0 ? (pcCount / totalDevices) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div className="dist-item">
                <div className="dist-meta">
                  <span className="dist-name">Monitores</span>
                  <span className="dist-count">{monitorCount}</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill blue" style={{ width: `${totalDevices > 0 ? (monitorCount / totalDevices) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div className="dist-item">
                <div className="dist-meta">
                  <span className="dist-name">Impresoras</span>
                  <span className="dist-count">{printerCount}</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill green" style={{ width: `${totalDevices > 0 ? (printerCount / totalDevices) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div className="dist-item">
                <div className="dist-meta">
                  <span className="dist-name">Teléfonos</span>
                  <span className="dist-count">{phoneCount}</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill yellow" style={{ width: `${totalDevices > 0 ? (phoneCount / totalDevices) * 100 : 0}%` }}></div>
                </div>
              </div>

              {accessoryCount > 0 && (
                <div className="dist-item">
                  <div className="dist-meta">
                    <span className="dist-name">Accesorios</span>
                    <span className="dist-count">{accessoryCount}</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill purple" style={{ width: `${totalDevices > 0 ? (accessoryCount / totalDevices) * 100 : 0}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Component Alerts */}
          <div className="card-glass content-card">
            <div className="card-header-with-action">
              <h2 className="card-title">Alertas de Repuestos en Bodega</h2>
              <Link href="/componentes" className="card-action-link">Ver todo</Link>
            </div>
            {lowStockComponents.length === 0 ? (
              <div className="empty-state-simple">
                <div className="empty-icon-wrapper green">
                  <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <span>Stock de componentes óptimo. Sin alertas activas.</span>
              </div>
            ) : (
              <div className="alerts-list">
                {lowStockComponents.map((c) => (
                  <div key={c.id} className="alert-item">
                    <div className="alert-bullet"></div>
                    <div className="alert-info">
                      <span className="alert-name">{c.nombre}</span>
                      <span className="alert-location">{c.ubicacion}</span>
                    </div>
                    <div className="alert-stock badge badge-dado_de_baja">
                      {c.cantidadDisponible} un.
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-column">
          {/* Recent Repairs */}
          <div className="card-glass content-card full-height">
            <div className="card-header-with-action">
              <h2 className="card-title">Mantenimiento y Reparaciones Recientes</h2>
              <Link href="/reparaciones" className="card-action-link">Ver historial</Link>
            </div>
            
            {recentRepairs.length === 0 ? (
              <div className="empty-state">
                <span>No se registran ordenes de reparación.</span>
              </div>
            ) : (
              <div className="repairs-timeline">
                {recentRepairs.map((r) => (
                  <div key={r.id} className="timeline-item">
                    <div className={`timeline-badge-dot ${r.estado.toLowerCase()}`}></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-device">
                          {r.dispositivo.marca} {r.dispositivo.modelo} ({r.dispositivo.numeroSerie})
                        </span>
                        <span className={`badge badge-${r.estado.toLowerCase()}`}>
                          {r.estado}
                        </span>
                      </div>
                      <p className="timeline-desc">{r.descripcionFalla}</p>
                      {r.solucion && <p className="timeline-solution"><strong>Solución:</strong> {r.solucion}</p>}
                      <div className="timeline-footer">
                        <span>Envío: {new Date(r.fechaEnvio).toLocaleDateString("es-CL")}</span>
                        {r.fechaRetorno && (
                          <span className="margin-left-12">Retorno: {new Date(r.fechaRetorno).toLocaleDateString("es-CL")}</span>
                        )}
                        <span className="timeline-tech">Resp: {r.tecnicoEncargado}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
