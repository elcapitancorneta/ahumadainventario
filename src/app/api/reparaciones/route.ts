import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // Check admin authorization
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get("isAdmin")?.value === "true";

    if (!isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await request.json();

    const repair = await prisma.historialReparacion.create({
      data: {
        dispositivoId: data.dispositivoId,
        descripcionFalla: data.descripcionFalla,
        solucion: data.solucion || null,
        fechaEnvio: data.fechaEnvio ? new Date(data.fechaEnvio) : new Date(),
        fechaRetorno: data.fechaRetorno ? new Date(data.fechaRetorno) : null,
        costo: data.costo !== undefined && data.costo !== null ? parseFloat(data.costo) : null,
        tecnicoEncargado: data.tecnicoEncargado || "Soporte TI",
        estado: data.estado || "EN_PROCESO",
      },
    });

    // Optionally update the device state
    if (data.updateDeviceStatus && data.estado) {
      let deviceStatus = "OPERATIVO";
      if (data.estado === "EN_PROCESO") {
        deviceStatus = "REPARACION";
      } else if (data.estado === "IRREPARABLE") {
        deviceStatus = "MALO";
      }
      
      await prisma.dispositivo.update({
        where: { id: data.dispositivoId },
        data: { estado: deviceStatus }
      });
    }

    return NextResponse.json({ success: true, repair });
  } catch (error: any) {
    console.error("Error creating repair record:", error);
    return NextResponse.json({ error: "Error al registrar la reparación" }, { status: 500 });
  }
}
