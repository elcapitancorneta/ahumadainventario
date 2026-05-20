import prisma from "@/lib/prisma";
import EstadisticasClient from "./EstadisticasClient";

export const revalidate = 0;

export default async function EstadisticasPage() {
  // Aggregate devices by type
  const devicesByType = await prisma.dispositivo.groupBy({
    by: ["tipo"],
    _count: { id: true },
  });

  // Aggregate devices by estado
  const devicesByEstado = await prisma.dispositivo.groupBy({
    by: ["estado"],
    _count: { id: true },
  });

  // Aggregate devices by categoria
  const devicesByCategoria = await prisma.dispositivo.groupBy({
    by: ["categoria"],
    _count: { id: true },
  });

  // Get total workers count and assigned count
  const totalWorkers = await prisma.trabajador.count();
  const assignedWorkers = await prisma.trabajador.count({
    where: {
      dispositivos: {
        some: {},
      },
    },
  });

  // Get total repair logs cost and statistics
  const totalRepairs = await prisma.historialReparacion.count();
  const repairsByEstado = await prisma.historialReparacion.groupBy({
    by: ["estado"],
    _count: { id: true },
  });

  const costAggregation = await prisma.historialReparacion.aggregate({
    _sum: { costo: true },
    _avg: { costo: true },
    _max: { costo: true },
  });

  const stats = {
    devicesByType: devicesByType.map((d) => ({ label: d.tipo || "Otro", count: d._count.id })),
    devicesByEstado: devicesByEstado.map((d) => ({ label: d.estado || "Sin Estado", count: d._count.id })),
    devicesByCategoria: devicesByCategoria.map((d) => ({ label: d.categoria || "Sin Categoría", count: d._count.id })),
    workers: {
      total: totalWorkers,
      assigned: assignedWorkers,
    },
    repairs: {
      total: totalRepairs,
      byEstado: repairsByEstado.map((r) => ({ label: r.estado || "Sin Estado", count: r._count.id })),
      totalCost: costAggregation._sum.costo || 0,
      avgCost: costAggregation._avg.costo || 0,
      maxCost: costAggregation._max.costo || 0,
    },
  };


  return (
    <div className="animate-fade-in" style={{ width: "100%" }}>
      <EstadisticasClient stats={stats} />
    </div>
  );
}
