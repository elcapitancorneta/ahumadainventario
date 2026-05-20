"use client";

interface StatsData {
  devicesByType: { label: string; count: number }[];
  devicesByEstado: { label: string; count: number }[];
  devicesByCategoria: { label: string; count: number }[];
  workers: {
    total: number;
    assigned: number;
  };
  repairs: {
    total: number;
    byEstado: { label: string; count: number }[];
    totalCost: number;
    avgCost: number;
    maxCost: number;
  };
}

interface EstadisticasClientProps {
  stats: StatsData;
}

export default function EstadisticasClient({ stats }: EstadisticasClientProps) {
  // Helpers
  const formatCLP = (val: number) => {
    return `$${Math.round(val).toLocaleString("es-CL")}`;
  };

  const totalDevices = stats.devicesByType.reduce((sum, d) => sum + d.count, 0);

  // Sorting
  const sortedTypes = [...stats.devicesByType].sort((a, b) => b.count - a.count);
  const sortedEstados = [...stats.devicesByEstado].sort((a, b) => b.count - a.count);
  const sortedCategorias = [...stats.devicesByCategoria].sort((a, b) => b.count - a.count);

  return (
    <div className="inventario-content">
      {/* Header */}
      <header className="page-header">
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 28, height: 28, color: "hsl(var(--primary))" }}>
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            Analíticas de Inventario TI
          </h1>
          <p className="page-subtitle">Métricas financieras, estados de hardware y cobertura de asignación de equipos</p>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="card-glass metric-card">
          <span className="metric-label">Equipos en Inventario</span>
          <span className="metric-value">{totalDevices}</span>
        </div>
        <div className="card-glass metric-card">
          <span className="metric-label">Colaboradores de la Empresa</span>
          <span className="metric-value text-highlight">{stats.workers.total}</span>
        </div>
        <div className="card-glass metric-card">
          <span className="metric-label">Reparaciones Ejecutadas</span>
          <span className="metric-value">{stats.repairs.total}</span>
        </div>
        <div className="card-glass metric-card">
          <span className="metric-label">Gasto Total de Soporte</span>
          <span className="metric-value text-highlight" style={{ fontSize: "20px" }}>
            {formatCLP(stats.repairs.totalCost)}
          </span>
        </div>
      </div>

      {/* Grid Charts */}
      <div className="device-detail-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
        
        {/* Type Distribution */}
        <div className="card-glass details-card" style={{ padding: "28px" }}>
          <h3 className="card-title" style={{ marginBottom: "20px" }}>Distribución por Tipo de Equipo</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {sortedTypes.map((item) => {
              const pct = totalDevices > 0 ? Math.round((item.count / totalDevices) * 100) : 0;
              return (
                <div key={item.label} style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "14px" }}>
                    <span className="font-semibold text-white">{item.label}</span>
                    <span className="text-muted">
                      {item.count} unidades <strong style={{ color: "hsl(var(--primary))" }}>({pct}%)</strong>
                    </span>
                  </div>
                  <div style={{ height: "8px", width: "100%", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: "linear-gradient(90deg, hsl(var(--primary)) 0%, #ff4070 100%)",
                        borderRadius: "4px",
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Health Status */}
        <div className="card-glass details-card" style={{ padding: "28px" }}>
          <h3 className="card-title" style={{ marginBottom: "20px" }}>Estado Operativo de Activos</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {sortedEstados.map((item) => {
              const pct = totalDevices > 0 ? Math.round((item.count / totalDevices) * 100) : 0;
              
              // Color mapping for state bars
              let color = "hsl(var(--primary))";
              if (item.label === "OPERATIVO" || item.label === "NUEVO") {
                color = "hsl(var(--success))";
              } else if (item.label === "MALO" || item.label === "DE_BAJA") {
                color = "hsl(var(--danger))";
              } else if (item.label === "EN_REPARACION" || item.label === "EN SOPORTE") {
                color = "hsl(var(--warning))";
              }

              return (
                <div key={item.label} style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "14px" }}>
                    <span className="font-semibold text-white">{item.label}</span>
                    <span className="text-muted">
                      {item.count} unidades <strong>({pct}%)</strong>
                    </span>
                  </div>
                  <div style={{ height: "8px", width: "100%", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        backgroundColor: color,
                        borderRadius: "4px",
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial metrics */}
        <div className="card-glass details-card" style={{ padding: "28px" }}>
          <h3 className="card-title" style={{ marginBottom: "24px" }}>Resumen Financiero de Soporte TI</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px" }}>
              <div>
                <h4 className="text-white" style={{ fontSize: "15px", margin: 0 }}>Gasto Histórico Acumulado</h4>
                <p className="text-muted" style={{ fontSize: "12px", margin: "4px 0 0 0" }}>Inversión total en reparaciones y servicios</p>
              </div>
              <span className="text-highlight font-bold" style={{ fontSize: "20px" }}>
                {formatCLP(stats.repairs.totalCost)}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px" }}>
              <div>
                <h4 className="text-white" style={{ fontSize: "15px", margin: 0 }}>Costo Promedio por Reparación</h4>
                <p className="text-muted" style={{ fontSize: "12px", margin: "4px 0 0 0" }}>Gasto medio de reparación de un equipo</p>
              </div>
              <span className="text-white font-bold" style={{ fontSize: "18px" }}>
                {formatCLP(stats.repairs.avgCost)}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 className="text-white" style={{ fontSize: "15px", margin: 0 }}>Costo de Reparación Máximo</h4>
                <p className="text-muted" style={{ fontSize: "12px", margin: "4px 0 0 0" }}>Gasto más alto registrado en un ticket</p>
              </div>
              <span className="text-white font-bold" style={{ fontSize: "18px" }}>
                {formatCLP(stats.repairs.maxCost)}
              </span>
            </div>

          </div>
        </div>

        {/* Coverage/Assigned statistics */}
        <div className="card-glass details-card" style={{ padding: "28px" }}>
          <h3 className="card-title" style={{ marginBottom: "20px" }}>Tasa de Asignación a Personal</h3>
          
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "20px 0" }}>
            <div style={{ textAlign: "center" }}>
              <span className="text-highlight" style={{ fontSize: "42px", fontWeight: 800 }}>
                {stats.workers.total > 0 ? Math.round((stats.workers.assigned / stats.workers.total) * 100) : 0}%
              </span>
              <p className="text-muted" style={{ fontSize: "13px", marginTop: "4px" }}>
                de los colaboradores tienen equipos asignados
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px", fontSize: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="text-muted">Colaboradores con activos TI:</span>
              <span className="text-white font-semibold">{stats.workers.assigned} personas</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="text-muted">Colaboradores sin equipos vinculados:</span>
              <span className="text-white font-semibold">{stats.workers.total - stats.workers.assigned} personas</span>
            </div>
          </div>
        </div>

      </div>

      {/* Distribution by Category */}
      <div className="card-glass details-card" style={{ padding: "28px", marginTop: "24px" }}>
        <h3 className="card-title" style={{ marginBottom: "20px" }}>Inventario por Categoría (Hojas del Excel)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
          {sortedCategorias.map((item) => {
            const pct = totalDevices > 0 ? Math.round((item.count / totalDevices) * 100) : 0;
            return (
              <div key={item.label} style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "13px" }}>
                  <span className="font-semibold text-white">{item.label}</span>
                  <span className="text-muted">
                    {item.count} equipos ({pct}%)
                  </span>
                </div>
                <div style={{ height: "6px", width: "100%", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      backgroundColor: "rgba(255, 255, 255, 0.4)",
                      borderRadius: "3px",
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
