import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const worker = await prisma.trabajador.findUnique({
      where: { id },
      include: {
        dispositivos: true,
      },
    });

    if (!worker) {
      return NextResponse.json({ error: "Trabajador no encontrado" }, { status: 404 });
    }

    return NextResponse.json(worker);
  } catch {
    return NextResponse.json({ error: "Error al cargar el trabajador" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get("isAdmin")?.value === "true";

    if (!isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { nombre, rut, cargo, departamento, correo } = body;

    if (!nombre || !rut || !cargo || !departamento || !correo) {
      return NextResponse.json({ error: "Campos requeridos incompletos" }, { status: 400 });
    }

    const updated = await prisma.trabajador.update({
      where: { id },
      data: {
        nombre,
        rut,
        cargo,
        departamento,
        correo,
      },
    });

    return NextResponse.json({ success: true, worker: updated });
  } catch {
    return NextResponse.json({ error: "Error de servidor al editar trabajador" }, { status: 500 });
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

    // Set devices related to this worker to null
    await prisma.dispositivo.updateMany({
      where: { trabajadorId: id },
      data: {
        trabajadorId: null,
        trabajadorNombre: null,
      },
    });

    await prisma.trabajador.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error de servidor al eliminar trabajador" }, { status: 500 });
  }
}
