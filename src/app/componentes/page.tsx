import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import ComponentesClient from "./ComponentesClient";

export const revalidate = 0; // Prevent stale caching of stock

export default async function ComponentesPage() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("isAdmin")?.value === "true";

  // Fetch all component types
  const components = await prisma.componente.findMany({
    orderBy: {
      nombre: "asc",
    },
  });

  return (
    <div className="animate-fade-in" style={{ width: "100%" }}>
      <ComponentesClient initialComponents={components} isAdmin={isAdmin} />
    </div>
  );
}
