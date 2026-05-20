"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface DeviceDetailActionsProps {
  deviceId: string;
  deviceLabel: string;
}

export default function DeviceDetailActions({ deviceId, deviceLabel }: DeviceDetailActionsProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm(`¿Estás seguro de que deseas eliminar el dispositivo "${deviceLabel}"?\nEsta acción es permanente.`)) {
      try {
        const res = await fetch(`/api/inventario/${deviceId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          alert("Dispositivo eliminado con éxito.");
          router.push("/inventario");
          router.refresh();
        } else {
          const err = await res.json();
          alert(`Error: ${err.error || "No se pudo eliminar el equipo"}`);
        }
      } catch {
        alert("Error de conexión al eliminar el equipo.");
      }
    }
  };

  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
      <Link href={`/inventario/${deviceId}/editar`} className="btn btn-secondary btn-sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, marginRight: 6 }}>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Editar Equipo
      </Link>
      <button onClick={handleDelete} className="btn btn-danger btn-sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, marginRight: 6 }}>
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        Eliminar
      </button>
    </div>
  );
}
