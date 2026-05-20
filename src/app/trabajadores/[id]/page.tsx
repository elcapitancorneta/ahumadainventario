import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TrabajadorDetailPage({ params }: PageProps) {
  const { id } = await params;

  const worker = await prisma.trabajador.findUnique({
    where: { id },
    include: {
      dispositivos: true,
    },
  });

  if (!worker) {
    notFound();
  }

  return (
    <div className="inventario-content">
      {/* Header */}
      <header className="page-header">
        <div>
          <Link href="/trabajadores" className="back-link">
            ← Volver a Trabajadores
          </Link>
          <h1 className="page-title" style={{ marginTop: "8px" }}>
            Ficha de Colaborador
          </h1>
          <p className="page-subtitle">Información general y asignación de activos de TI</p>
        </div>
      </header>

      {/* Main Profile Grid */}
      <div className="device-detail-grid">
        {/* Left Column: Personal info */}
        <div className="card-glass details-card" style={{ padding: "30px" }}>
          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
              color: "hsl(var(--primary))",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ width: "35px", height: "35px" }}
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          <h2 className="text-white" style={{ fontSize: "24px", fontWeight: 800, marginBottom: "4px" }}>
            {worker.nombre}
          </h2>
          <p className="text-muted" style={{ fontSize: "14px", marginBottom: "24px" }}>
            {worker.cargo}
          </p>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px" }}
          >
            <div>
              <span className="spec-label" style={{ fontSize: "11px", textTransform: "uppercase", color: "hsl(var(--text-muted))", fontWeight: 700 }}>
                RUT / Identificador
              </span>
              <p className="spec-val" style={{ fontSize: "15px", color: "#fff", fontWeight: 500 }}>
                {worker.rut}
              </p>
            </div>

            <div>
              <span className="spec-label" style={{ fontSize: "11px", textTransform: "uppercase", color: "hsl(var(--text-muted))", fontWeight: 700 }}>
                Departamento / Unidad
              </span>
              <p className="spec-val" style={{ fontSize: "15px", color: "#fff", fontWeight: 500 }}>
                {worker.departamento}
              </p>
            </div>

            <div>
              <span className="spec-label" style={{ fontSize: "11px", textTransform: "uppercase", color: "hsl(var(--text-muted))", fontWeight: 700 }}>
                Correo Electrónico
              </span>
              <p className="spec-val" style={{ fontSize: "15px", color: "hsl(var(--primary))", fontWeight: 500 }}>
                {worker.correo}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Devices Assigned */}
        <div className="card-glass details-card" style={{ padding: "30px" }}>
          <h3 className="card-title" style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ width: "20px", height: "20px", color: "hsl(var(--primary))" }}
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            Dispositivos Asignados ({worker.dispositivos.length})
          </h3>

          {worker.dispositivos.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 20px" }}>
              <p className="text-muted">Este colaborador no tiene equipos de TI registrados actualmente.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {worker.dispositivos.map((dev) => (
                <Link
                  key={dev.id}
                  href={`/inventario/${dev.id}`}
                  className="card-glass hover-scale"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 20px",
                    textDecoration: "none",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "12px",
                  }}
                >
                  <div>
                    <h4 className="text-white" style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>
                      {dev.marca} {dev.modelo}
                    </h4>
                    <p className="text-muted" style={{ fontSize: "12px", margin: "4px 0 0 0" }}>
                      S/N: {dev.numeroSerie || "N/A"} • Categoría: {dev.categoria}
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className={`badge ${dev.estado === "OPERATIVO" ? "badge-success" : "badge-warning"}`} style={{ fontSize: "11px" }}>
                      {dev.estado}
                    </span>
                    <span style={{ color: "hsl(var(--text-muted))" }}>➔</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
