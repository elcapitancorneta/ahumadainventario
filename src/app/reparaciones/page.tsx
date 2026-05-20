import prisma from "@/lib/prisma";
import ReparacionesClient from "./ReparacionesClient";

export const revalidate = 0;

export default async function ReparacionesPage() {
  // Query all repairs with device details
  const repairs = await prisma.historialReparacion.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      dispositivo: {
        select: {
          id: true,
          marca: true,
          modelo: true,
          tipo: true,
        },
      },
    },
  });

  return (
    <div className="animate-fade-in" style={{ width: "100%" }}>
      <ReparacionesClient initialRepairs={repairs} />
    </div>
  );
}
