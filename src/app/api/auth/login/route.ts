import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("isAuthenticated")?.value === "true";
  const isAdmin = cookieStore.get("isAdmin")?.value === "true";
  
  // Try to find matching user if cookies are set
  return NextResponse.json({ isAuthenticated, isAdmin });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const username = data.username?.trim();
    const password = data.password;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Usuario y contraseña requeridos" },
        { status: 400 }
      );
    }

    // Find user in database
    const user = await prisma.usuario.findUnique({
      where: { username },
    });

    if (!user || user.password !== password) {
      return NextResponse.json(
        { success: false, error: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();

    // Set authenticated cookie
    cookieStore.set("isAuthenticated", "true", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    // Set admin cookie if the role is ADMIN
    if (user.rol === "ADMIN") {
      cookieStore.set("isAdmin", "true", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 24 hours
      });
    } else {
      cookieStore.delete("isAdmin");
    }

    return NextResponse.json({
      success: true,
      username: user.username,
      rol: user.rol,
      isAdmin: user.rol === "ADMIN",
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Error de servidor al iniciar sesión" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("isAuthenticated");
  cookieStore.delete("isAdmin");
  return NextResponse.json({ success: true });
}
