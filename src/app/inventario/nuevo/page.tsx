import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import DispositivoForm from "@/components/DispositivoForm";

interface PageProps {
  searchParams: Promise<{ categoria?: string }>;
}

export default async function NuevoDispositivoPage({ searchParams }: PageProps) {
  const { categoria } = await searchParams;

  // Protect route server-side
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("isAdmin")?.value === "true";
  
  if (!isAdmin) {
    redirect("/inventario");
  }

  const defaultCategory = categoria || "NOTEBOOKS_CAF";

  return (
    <div className="detail-page-wrapper animate-fade-in">
      <header className="page-header">
        <div>
          <div className="breadcrumb">
            <Link href="/inventario" className="breadcrumb-link">Inventario</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Nuevo Equipo</span>
          </div>
          <h1 className="page-title">Agregar Nuevo Dispositivo</h1>
        </div>
        <div>
          <Link href="/inventario" className="back-btn card-glass">
            Volver al Inventario
          </Link>
        </div>
      </header>

      <div className="card-glass content-card" style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        <DispositivoForm initialCategory={defaultCategory} />
      </div>
    </div>
  );
}
