import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const workers = await prisma.trabajador.findMany({
      orderBy: { nombre: "asc" },
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
    return NextResponse.json(workers);
  } catch {
    return NextResponse.json({ error: "Error al cargar trabajadores" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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

    const worker = await prisma.trabajador.create({
      data: {
        nombre,
        rut,
        cargo,
        departamento,
        correo,
      },
    });

    return NextResponse.json({ success: true, worker });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Error al guardar el trabajador. Asegúrese de que el RUT sea único." },
      { status: 500 }
    );
  }
}
