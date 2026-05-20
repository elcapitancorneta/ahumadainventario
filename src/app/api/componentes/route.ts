import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const components = await prisma.componente.findMany({
      orderBy: { nombre: "asc" },
    });
    return NextResponse.json(components);
  } catch {
    return NextResponse.json({ error: "Error al cargar componentes" }, { status: 500 });
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
    const { nombre, tipo, cantidadDisponible, ubicacion } = body;

    if (!nombre || !tipo || cantidadDisponible === undefined || !ubicacion) {
      return NextResponse.json({ error: "Campos requeridos incompletos" }, { status: 400 });
    }

    const component = await prisma.componente.create({
      data: {
        nombre,
        tipo,
        cantidadDisponible: parseInt(cantidadDisponible, 10),
        ubicacion,
      },
    });

    return NextResponse.json({ success: true, component });
  } catch {
    return NextResponse.json({ error: "Error de servidor al guardar componente" }, { status: 500 });
  }
}
