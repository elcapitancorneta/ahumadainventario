import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import DeviceDetailActions from "@/components/DeviceDetailActions";
import RepairForm from "@/components/RepairForm";

export const revalidate = 0; // Disable cache for real-time updates

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DispositivoDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Check admin authorization
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("isAdmin")?.value === "true";

  // Fetch device and its repairs
  const device = await prisma.dispositivo.findUnique({
    where: { id },
    include: {
      reparaciones: {
        orderBy: {
          fechaEnvio: "desc",
        },
      },
    },
  });

  if (!device) {
    notFound();
  }

  // Parse technical details
  let techDetails: Record<string, any> = {};
  if (device.detallesTecnicos) {
    try {
      techDetails = JSON.parse(device.detallesTecnicos);
    } catch {
      // ignore
    }
  }

  // Map of tech detail keys to user-friendly Spanish labels
  const labelMap: Record<string, string> = {
    tipoEquipo: "Tipo de Equipo",
    uso: "Uso Asignado",
    nombreEquipo: "Nombre del Equipo (Hostname)",
    trabajando: "En Funcionamiento",
    area: "Área / Departamento",
    usuarioAnterior: "Usuario Anterior",
    seccion: "Sección",
    condicion: "Condición",
    articulosFaltantes: "Artículos Faltantes",
    estadoEstetico: "Estado Estético",
    numero: "Número Telefónico",
    condicionChip: "Condición del CHIP",
    imei: "IMEI",
    cantidad: "Cantidad",
    fechaEntrega: "Fecha de Entrega",
    equipo: "Tipo Hardware",
    memoria: "Memoria RAM",
    disco: "Unidad de Disco",
    extra: "Detalles Adicionales"
  };

  return (
    <div className="detail-page-wrapper animate-fade-in">
      {/* Breadcrumb Header */}
      <header className="page-header">
        <div>
          <div className="breadcrumb">
            <Link href="/inventario" className="breadcrumb-link">Inventario</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Detalle del Equipo</span>
          </div>
          <h1 className="page-title">
            {device.marca || "Dispositivo"} {device.modelo}
          </h1>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {isAdmin && (
            <DeviceDetailActions
              deviceId={device.id}
              deviceLabel={`${device.marca || "Dispositivo"} ${device.modelo || ""}`}
            />
          )}
          <Link href="/inventario" className="back-btn card-glass">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, marginRight: 8 }}>
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Volver al Inventario
          </Link>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="dashboard-grid">
        {/* Left Column: Device Info */}
        <div className="dashboard-column">
          <div className="card-glass content-card">
            <div className="card-header-with-badge">
              <h2 className="card-title">Ficha Técnica</h2>
              <span className={`badge badge-${(device.estado || "operativo").toLowerCase().replace(" ", "_")}`}>
                {device.estado || "OPERATIVO"}
              </span>
            </div>

            <div className="tech-specs-grid">
              <div className="spec-item">
                <span className="spec-label">Categoría Original</span>
                <span className="spec-value text-highlight">
                  {device.categoria?.replace("_", " ") || "No especificada"}
                </span>
              </div>

              <div className="spec-item">
                <span className="spec-label">Tipo Dispositivo</span>
                <span className="spec-value">{device.tipo}</span>
              </div>

              <div className="spec-item">
                <span className="spec-label">Número de Serie (S/N)</span>
                <span className="spec-value code-text font-bold">{device.numeroSerie || "No posee"}</span>
              </div>

              {device.codigoInventario && (
                <div className="spec-item">
                  <span className="spec-label">Código Inventario Asus</span>
                  <span className="spec-value code-text">{device.codigoInventario}</span>
                </div>
              )}

              <div className="spec-item">
                <span className="spec-label">Ubicación Actual</span>
                <span className="spec-value">{device.ubicacion || "Bodega / No definida"}</span>
              </div>

              <div className="spec-item">
                <span className="spec-label">Asignado a</span>
                <span className="spec-value font-bold text-white">
                  {device.trabajadorNombre || "Sin asignar (En Bodega)"}
                </span>
              </div>

              <div className="spec-item">
                <span className="spec-label">Fecha de Ingreso</span>
                <span className="spec-value">
                  {new Date(device.fechaIngreso).toLocaleDateString("es-CL", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Custom attributes from JSON */}
            {Object.keys(techDetails).length > 0 && (
              <div className="custom-specs-section">
                <h3 className="section-subtitle">Detalles Específicos</h3>
                <div className="tech-specs-grid border-top">
                  {Object.entries(techDetails).map(([key, value]) => {
                    if (value === undefined || value === null || value === "") return null;
                    return (
                      <div className="spec-item" key={key}>
                        <span className="spec-label">{labelMap[key] || key}</span>
                        <span className="spec-value">{String(value)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {device.comentarios && (
              <div className="comments-section">
                <h3 className="section-subtitle">Observaciones Generales</h3>
                <p className="comments-text">{device.comentarios}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Repairs timeline */}
        <div className="dashboard-column">
          <div className="card-glass content-card">
            <h2 className="card-title">Historial de Reparaciones y Soporte</h2>

            {device.reparaciones.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon-wrapper green" style={{ marginBottom: 12 }}>
                  <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h3>Sin incidentes</h3>
                <p>Este dispositivo no registra reportes de fallas ni mantenimientos.</p>
              </div>
            ) : (
              <div className="repairs-timeline" style={{ marginTop: 16 }}>
                {device.reparaciones.map((rep) => (
                  <div key={rep.id} className="timeline-item">
                    <div className={`timeline-badge-dot ${rep.estado.toLowerCase()}`}></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-device font-bold">Reporte de Falla</span>
                        <span className={`badge badge-${rep.estado.toLowerCase()}`}>
                          {rep.estado}
                        </span>
                      </div>
                      <p className="timeline-desc">{rep.descripcionFalla}</p>
                      
                      {rep.solucion && (
                        <p className="timeline-solution">
                          <strong>Solución:</strong> {rep.solucion}
                        </p>
                      )}

                      {rep.costo !== null && rep.costo > 0 && (
                        <p className="timeline-cost">
                          <strong>Costo de Reparación:</strong> ${rep.costo.toLocaleString("es-CL")} CLP
                        </p>
                      )}

                      <div className="timeline-footer">
                        <span>Envío: {new Date(rep.fechaEnvio).toLocaleDateString("es-CL")}</span>
                        {rep.fechaRetorno && (
                          <span className="margin-left-12">
                            Retorno: {new Date(rep.fechaRetorno).toLocaleDateString("es-CL")}
                          </span>
                        )}
                        <span className="timeline-tech">Encargado: {rep.tecnicoEncargado}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Repair Form for Admins */}
          {isAdmin && <RepairForm deviceId={device.id} />}
        </div>
      </div>
    </div>
  );
}
