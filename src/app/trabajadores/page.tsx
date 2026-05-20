import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import TrabajadoresClient from "./TrabajadoresClient";

export const revalidate = 0;

export default async function TrabajadoresPage() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("isAdmin")?.value === "true";

  const workers = await prisma.trabajador.findMany({
    orderBy: {
      nombre: "asc",
    },
    include: {
      dispositivos: {
        select: {
          id: true,
          tipo: true,
          marca: true,
          modelo: true,
        },
      },
    },
  });

  return (
    <div className="animate-fade-in" style={{ width: "100%" }}>
      <TrabajadoresClient initialWorkers={workers} isAdmin={isAdmin} />
    </div>
  );
}
