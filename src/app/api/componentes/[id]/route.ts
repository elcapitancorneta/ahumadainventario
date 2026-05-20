import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get("isAdmin")?.value === "true";

    if (!isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { nombre, tipo, cantidadDisponible, ubicacion } = body;

    if (!nombre || !tipo || cantidadDisponible === undefined || !ubicacion) {
      return NextResponse.json({ error: "Campos requeridos incompletos" }, { status: 400 });
    }

    const updated = await prisma.componente.update({
      where: { id },
      data: {
        nombre,
        tipo,
        cantidadDisponible: parseInt(cantidadDisponible, 10),
        ubicacion,
      },
    });

    return NextResponse.json({ success: true, component: updated });
  } catch {
    return NextResponse.json({ error: "Error de servidor al editar componente" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get("isAdmin")?.value === "true";

    if (!isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await prisma.componente.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error de servidor al eliminar componente" }, { status: 500 });
  }
}
