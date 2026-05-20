import prisma from "@/lib/prisma";
import InventarioClient from "./InventarioClient";

export const revalidate = 0; // Disable caching to ensure real-time updates

export default async function InventarioPage() {
  // Query all devices and cotizaciones
  const devices = await prisma.dispositivo.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const cotizaciones = await prisma.cotizacion.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="inventario-wrapper animate-fade-in" style={{ width: '100%' }}>
      <InventarioClient initialDevices={devices} initialCotizaciones={cotizaciones} />
    </div>
  );
}
