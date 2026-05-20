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

    const device = await prisma.dispositivo.create({
      data: {
        tipo: data.tipo || "NOTEBOOK",
        marca: data.marca || null,
        modelo: data.modelo || null,
        numeroSerie: data.numeroSerie || null,
        codigoInventario: data.codigoInventario || null,
        estado: data.estado || "OPERATIVO",
        trabajadorNombre: data.trabajadorNombre || null,
        ubicacion: data.ubicacion || null,
        fechaIngreso: data.fechaIngreso ? new Date(data.fechaIngreso) : new Date(),
        comentarios: data.comentarios || null,
        categoria: data.categoria || "NOTEBOOKS_CAF",
        detallesTecnicos: data.detallesTecnicos ? JSON.stringify(data.detallesTecnicos) : null,
      },
    });

    return NextResponse.json({ success: true, device });
  } catch (error: any) {
    console.error("Error creating device:", error);
    return NextResponse.json({ error: "Error al crear el dispositivo" }, { status: 500 });
  }
}
