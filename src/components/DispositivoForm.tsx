"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Device {
  id?: string;
  tipo: string;
  marca: string | null;
  modelo: string | null;
  numeroSerie: string | null;
  codigoInventario: string | null;
  estado: string | null;
  detallesTecnicos: string | null;
  categoria: string | null;
  trabajadorNombre: string | null;
  ubicacion: string | null;
  fechaIngreso?: Date | string;
  comentarios: string | null;
}

interface DispositivoFormProps {
  device?: Device;
  initialCategory?: string;
}

export default function DispositivoForm({ device, initialCategory }: DispositivoFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Base state fields
  const [categoria, setCategoria] = useState(device?.categoria || initialCategory || "NOTEBOOKS_CAF");
  const [tipo, setTipo] = useState(device?.tipo || "NOTEBOOK");
  const [marca, setMarca] = useState(device?.marca || "");
  const [modelo, setModelo] = useState(device?.modelo || "");
  const [numeroSerie, setNumeroSerie] = useState(device?.numeroSerie || "");
  const [codigoInventario, setCodigoInventario] = useState(device?.codigoInventario || "");
  const [estado, setEstado] = useState(device?.estado || "OPERATIVO");
  const [trabajadorNombre, setTrabajadorNombre] = useState(device?.trabajadorNombre || "");
  const [ubicacion, setUbicacion] = useState(device?.ubicacion || "");
  const [comentarios, setComentarios] = useState(device?.comentarios || "");

  // Technical details dynamic fields state
  const [techFields, setTechFields] = useState<Record<string, any>>({});

  // Parse existing details on load
  useEffect(() => {
    if (device?.detallesTecnicos) {
      try {
        setTechFields(JSON.parse(device.detallesTecnicos));
      } catch {
        setTechFields({});
      }
    }
  }, [device]);

  // Automatically update 'tipo' based on category changes (sensible defaults)
  useEffect(() => {
    if (!device) {
      if (categoria.includes("NOTEBOOK") || categoria === "ASUS") {
        setTipo("NOTEBOOK");
      } else if (categoria.includes("PC") || categoria.includes("DESKTOP")) {
        setTipo("DESKTOP");
      } else if (categoria.includes("CELULAR")) {
        setTipo("CELULAR");
      } else if (categoria === "CARGADORES" || categoria === "AUDIFONOS" || categoria === "MOCHILAS" || categoria === "TECLADOS_MOUSE") {
        setTipo("ACCESORIO");
      }
    }
  }, [categoria, device]);

  const handleTechChange = (key: string, value: any) => {
    setTechFields((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      tipo,
      marca: marca || null,
      modelo: modelo || null,
      numeroSerie: numeroSerie || null,
      codigoInventario: codigoInventario || null,
      estado,
      trabajadorNombre: trabajadorNombre || null,
      ubicacion: ubicacion || null,
      comentarios: comentarios || null,
      categoria,
      detallesTecnicos: techFields,
    };

    try {
      const url = device ? `/api/inventario/${device.id}` : "/api/inventario";
      const method = device ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        router.push("/inventario");
        router.refresh();
      } else {
        setError(result.error || "Ocurrió un error al guardar el dispositivo.");
      }
    } catch {
      setError("Error de red al guardar el dispositivo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="dispositivo-form" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {error && (
        <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "hsl(var(--danger-bg))", border: "1px solid hsl(var(--danger) / 0.3)", color: "hsl(var(--danger))", fontWeight: 600, fontSize: "14px" }}>
          {error}
        </div>
      )}

      {/* Grid Layout for General Data */}
      <div className="tech-specs-grid">
        <div className="spec-item">
          <label htmlFor="form-categoria">Categoría de Inventario</label>
          <select id="form-categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} disabled={!!device}>
            <option value="NOTEBOOKS_CAF">Notebooks CAF</option>
            <option value="PC_RECETARIO">PC Recetario</option>
            <option value="NOTEBOOKS_MALOS">Notebooks Malos</option>
            <option value="MOCHILAS">Mochilas</option>
            <option value="CELULARES_MALOS">Celulares Malos</option>
            <option value="CELULARES_ENTREGADOS">Celulares Entregados</option>
            <option value="CARGADORES">Cargadores</option>
            <option value="AUDIFONOS">Audífonos</option>
            <option value="TECLADOS_MOUSE">Teclados + Mouse</option>
            <option value="ASUS">Asus (Corporativo)</option>
          </select>
        </div>

        <div className="spec-item">
          <label htmlFor="form-tipo">Tipo Físico</label>
          <select id="form-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="NOTEBOOK">Notebook / Portátil</option>
            <option value="DESKTOP">PC Escritorio</option>
            <option value="CELULAR">Teléfono Celular</option>
            <option value="ACCESORIO">Accesorio / Hardware</option>
            <option value="MONITOR">Monitor</option>
            <option value="IMPRESORA">Impresora</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>

        <div className="spec-item">
          <label htmlFor="form-marca">Marca</label>
          <input
            id="form-marca"
            type="text"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            placeholder="Ej. Lenovo, HP, Apple"
          />
        </div>

        <div className="spec-item">
          <label htmlFor="form-modelo">Modelo</label>
          <input
            id="form-modelo"
            type="text"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            placeholder="Ej. ThinkPad E14, iPhone 13"
          />
        </div>

        <div className="spec-item">
          <label htmlFor="form-sn">Número de Serie (S/N)</label>
          <input
            id="form-sn"
            type="text"
            value={numeroSerie}
            onChange={(e) => setNumeroSerie(e.target.value)}
            placeholder="Introduce el N/S de fábrica..."
          />
        </div>

        <div className="spec-item">
          <label htmlFor="form-codigo">Código Inventario Interno</label>
          <input
            id="form-codigo"
            type="text"
            value={codigoInventario}
            onChange={(e) => setCodigoInventario(e.target.value)}
            placeholder="Ej. Asus-002, CAF-08"
          />
        </div>

        <div className="spec-item">
          <label htmlFor="form-estado">Estado Operacional</label>
          <select id="form-estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="OPERATIVO">OPERATIVO</option>
            <option value="NUEVO">NUEVO / COMPRADO</option>
            <option value="USADO">USADO</option>
            <option value="BODEGA">BODEGA</option>
            <option value="REPARACION">EN REPARACIÓN</option>
            <option value="MALO">MAL ESTADO / DE BAJA</option>
          </select>
        </div>

        <div className="spec-item">
          <label htmlFor="form-trabajador">Asignado a (Nombre Trabajador)</label>
          <input
            id="form-trabajador"
            type="text"
            value={trabajadorNombre}
            onChange={(e) => setTrabajadorNombre(e.target.value)}
            placeholder="Nombre completo o área asignada..."
          />
        </div>

        <div className="spec-item">
          <label htmlFor="form-ubicacion">Ubicación Física</label>
          <input
            id="form-ubicacion"
            type="text"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            placeholder="Ej. Bodega Central, CAF Piso 3, Local 220"
          />
        </div>
      </div>

      {/* Dynamic technical section depending on Category */}
      <div style={{ marginTop: "12px", borderTop: "1px solid hsl(var(--border-color))", paddingTop: "20px" }}>
        <h3 className="section-subtitle" style={{ marginTop: 0 }}>Especificaciones de la Categoría</h3>

        <div className="tech-specs-grid" style={{ marginTop: "16px" }}>
          {/* NOTEBOOKS_CAF */}
          {categoria === "NOTEBOOKS_CAF" && (
            <>
              <div className="spec-item">
                <label>Nombre de Red (Hostname)</label>
                <input
                  type="text"
                  value={techFields.nombreEquipo || ""}
                  onChange={(e) => handleTechChange("nombreEquipo", e.target.value)}
                  placeholder="Ej. LAPTOP-CAF-25"
                />
              </div>
              <div className="spec-item">
                <label>Área / Departamento</label>
                <input
                  type="text"
                  value={techFields.area || ""}
                  onChange={(e) => handleTechChange("area", e.target.value)}
                  placeholder="Ej. Contabilidad, TI"
                />
              </div>
              <div className="spec-item">
                <label>¿Trabajando Actualmente?</label>
                <select
                  value={techFields.trabajando || "SI"}
                  onChange={(e) => handleTechChange("trabajando", e.target.value)}
                >
                  <option value="SI">SI</option>
                  <option value="NO">NO</option>
                </select>
              </div>
            </>
          )}

          {/* PC_RECETARIO */}
          {categoria === "PC_RECETARIO" && (
            <>
              <div className="spec-item">
                <label>Nombre de Red (Hostname)</label>
                <input
                  type="text"
                  value={techFields.nombreEquipo || ""}
                  onChange={(e) => handleTechChange("nombreEquipo", e.target.value)}
                  placeholder="Ej. RECETARIO-04"
                />
              </div>
              <div className="spec-item">
                <label>Sección / Caja</label>
                <input
                  type="text"
                  value={techFields.seccion || ""}
                  onChange={(e) => handleTechChange("seccion", e.target.value)}
                  placeholder="Ej. Empaque, Preparación"
                />
              </div>
            </>
          )}

          {/* NOTEBOOKS_MALOS & CELULARES_MALOS */}
          {(categoria === "NOTEBOOKS_MALOS" || categoria === "CELULARES_MALOS") && (
            <>
              <div className="spec-item">
                <label>Condición General / Diagnóstico</label>
                <input
                  type="text"
                  value={techFields.condicion || ""}
                  onChange={(e) => handleTechChange("condicion", e.target.value)}
                  placeholder="Ej. Placa madre quemada, pantalla rota"
                />
              </div>
              <div className="spec-item">
                <label>Artículos Faltantes</label>
                <input
                  type="text"
                  value={techFields.articulosFaltantes || ""}
                  onChange={(e) => handleTechChange("articulosFaltantes", e.target.value)}
                  placeholder="Ej. Sin cargador, sin batería"
                />
              </div>
              <div className="spec-item">
                <label>Estado Estético</label>
                <input
                  type="text"
                  value={techFields.estadoEstetico || ""}
                  onChange={(e) => handleTechChange("estadoEstetico", e.target.value)}
                  placeholder="Ej. Rayaduras leves, abolladura lateral"
                />
              </div>
            </>
          )}

          {/* MOCHILAS */}
          {categoria === "MOCHILAS" && (
            <>
              <div className="spec-item">
                <label>Área de Entrega</label>
                <input
                  type="text"
                  value={techFields.area || ""}
                  onChange={(e) => handleTechChange("area", e.target.value)}
                  placeholder="Ej. Logística, Delivery"
                />
              </div>
              <div className="spec-item">
                <label>Fecha de Entrega</label>
                <input
                  type="text"
                  value={techFields.fechaEntrega || ""}
                  onChange={(e) => handleTechChange("fechaEntrega", e.target.value)}
                  placeholder="Ej. 12-04-2025"
                />
              </div>
              <div className="spec-item">
                <label>Cantidad</label>
                <input
                  type="number"
                  value={techFields.cantidad || 1}
                  onChange={(e) => handleTechChange("cantidad", parseInt(e.target.value) || 1)}
                  placeholder="1"
                />
              </div>
            </>
          )}

          {/* CELULARES_ENTREGADOS */}
          {categoria === "CELULARES_ENTREGADOS" && (
            <>
              <div className="spec-item">
                <label>Número Telefónico Asignado</label>
                <input
                  type="text"
                  value={techFields.numero || ""}
                  onChange={(e) => handleTechChange("numero", e.target.value)}
                  placeholder="Ej. +569 1234 5678"
                />
              </div>
              <div className="spec-item">
                <label>IMEI del Equipo</label>
                <input
                  type="text"
                  value={techFields.imei || ""}
                  onChange={(e) => handleTechChange("imei", e.target.value)}
                  placeholder="Ej. 35824905..."
                />
              </div>
              <div className="spec-item">
                <label>Condición del CHIP Simcard</label>
                <input
                  type="text"
                  value={techFields.condicionChip || ""}
                  onChange={(e) => handleTechChange("condicionChip", e.target.value)}
                  placeholder="Ej. Habilitado Entel, Sin chip"
                />
              </div>
              <div className="spec-item">
                <label>Artículos Faltantes</label>
                <input
                  type="text"
                  value={techFields.articulosFaltantes || ""}
                  onChange={(e) => handleTechChange("articulosFaltantes", e.target.value)}
                  placeholder="Ej. Sin audífonos"
                />
              </div>
              <div className="spec-item">
                <label>Estado Estético</label>
                <input
                  type="text"
                  value={techFields.estadoEstetico || ""}
                  onChange={(e) => handleTechChange("estadoEstetico", e.target.value)}
                  placeholder="Ej. Impecable, desgaste por uso"
                />
              </div>
            </>
          )}

          {/* CARGADORES & AUDIFONOS */}
          {(categoria === "CARGADORES" || categoria === "AUDIFONOS") && (
            <>
              <div className="spec-item">
                <label>Artículos Faltantes</label>
                <input
                  type="text"
                  value={techFields.articulosFaltantes || ""}
                  onChange={(e) => handleTechChange("articulosFaltantes", e.target.value)}
                  placeholder="Ej. Sin estuche"
                />
              </div>
              <div className="spec-item">
                <label>Estado Estético</label>
                <input
                  type="text"
                  value={techFields.estadoEstetico || ""}
                  onChange={(e) => handleTechChange("estadoEstetico", e.target.value)}
                  placeholder="Ej. Plástico rayado"
                />
              </div>
              {categoria === "AUDIFONOS" && (
                <div className="spec-item">
                  <label>Detalles Extra</label>
                  <input
                    type="text"
                    value={techFields.extra || ""}
                    onChange={(e) => handleTechChange("extra", e.target.value)}
                    placeholder="Ej. Conexión USB, Bluetooth"
                  />
                </div>
              )}
            </>
          )}

          {/* TECLADOS_MOUSE */}
          {categoria === "TECLADOS_MOUSE" && (
            <>
              <div className="spec-item">
                <label>Área</label>
                <input
                  type="text"
                  value={techFields.area || ""}
                  onChange={(e) => handleTechChange("area", e.target.value)}
                  placeholder="Ej. Caja 2, Administración"
                />
              </div>
              <div className="spec-item">
                <label>Cantidad</label>
                <input
                  type="number"
                  value={techFields.cantidad || 1}
                  onChange={(e) => handleTechChange("cantidad", parseInt(e.target.value) || 1)}
                  placeholder="1"
                />
              </div>
            </>
          )}

          {/* ASUS */}
          {categoria === "ASUS" && (
            <>
              <div className="spec-item">
                <label>Memoria RAM</label>
                <input
                  type="text"
                  value={techFields.memoria || ""}
                  onChange={(e) => handleTechChange("memoria", e.target.value)}
                  placeholder="Ej. 16 GB, 8 GB"
                />
              </div>
              <div className="spec-item">
                <label>Disco Duro / Almacenamiento</label>
                <input
                  type="text"
                  value={techFields.disco || ""}
                  onChange={(e) => handleTechChange("disco", e.target.value)}
                  placeholder="Ej. 512 GB SSD, 1 TB HDD"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Comentarios */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
        <label htmlFor="form-comentarios">Observaciones y Comentarios Generales</label>
        <textarea
          id="form-comentarios"
          rows={4}
          value={comentarios}
          onChange={(e) => setComentarios(e.target.value)}
          placeholder="Añade cualquier nota adicional sobre el estado, reparaciones previas o asignación del equipo..."
        />
      </div>

      {/* Form Buttons */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px", borderTop: "1px solid hsl(var(--border-color))", paddingTop: "20px" }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => router.push("/inventario")}
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? "Guardando..." : device ? "Guardar Cambios" : "Crear Dispositivo"}
        </button>
      </div>
    </form>
  );
}
