import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;

    // Check admin authorization
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get("isAdmin")?.value === "true";

    if (!isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await request.json();

    const device = await prisma.dispositivo.update({
      where: { id },
      data: {
        tipo: data.tipo,
        marca: data.marca !== undefined ? data.marca : undefined,
        modelo: data.modelo !== undefined ? data.modelo : undefined,
        numeroSerie: data.numeroSerie !== undefined ? data.numeroSerie : undefined,
        codigoInventario: data.codigoInventario !== undefined ? data.codigoInventario : undefined,
        estado: data.estado !== undefined ? data.estado : undefined,
        trabajadorNombre: data.trabajadorNombre !== undefined ? data.trabajadorNombre : undefined,
        ubicacion: data.ubicacion !== undefined ? data.ubicacion : undefined,
        fechaIngreso: data.fechaIngreso ? new Date(data.fechaIngreso) : undefined,
        comentarios: data.comentarios !== undefined ? data.comentarios : undefined,
        categoria: data.categoria !== undefined ? data.categoria : undefined,
        detallesTecnicos: data.detallesTecnicos !== undefined ? JSON.stringify(data.detallesTecnicos) : undefined,
      },
    });

    return NextResponse.json({ success: true, device });
  } catch (error: any) {
    console.error("Error updating device:", error);
    return NextResponse.json({ error: "Error al actualizar el dispositivo" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;

    // Check admin authorization
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get("isAdmin")?.value === "true";

    if (!isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Delete the device
    await prisma.dispositivo.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting device:", error);
    return NextResponse.json({ error: "Error al eliminar el dispositivo" }, { status: 500 });
  }
}
