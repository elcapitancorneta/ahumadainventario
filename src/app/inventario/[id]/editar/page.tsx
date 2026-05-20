import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import DispositivoForm from "@/components/DispositivoForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarDispositivoPage({ params }: PageProps) {
  const { id } = await params;

  // Protect route server-side
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("isAdmin")?.value === "true";
  
  if (!isAdmin) {
    redirect("/inventario");
  }

  // Load device details
  const device = await prisma.dispositivo.findUnique({
    where: { id },
  });

  if (!device) {
    notFound();
  }

  return (
    <div className="detail-page-wrapper animate-fade-in">
      <header className="page-header">
        <div>
          <div className="breadcrumb">
            <Link href="/inventario" className="breadcrumb-link">Inventario</Link>
            <span className="breadcrumb-separator">/</span>
            <Link href={`/inventario/${device.id}`} className="breadcrumb-link">Detalle</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Editar Equipo</span>
          </div>
          <h1 className="page-title">
            Editar: {device.marca} {device.modelo}
          </h1>
        </div>
        <div>
          <Link href={`/inventario/${device.id}`} className="back-btn card-glass">
            Cancelar y Volver
          </Link>
        </div>
      </header>

      <div className="card-glass content-card" style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        <DispositivoForm device={device} />
      </div>
    </div>
  );
}
