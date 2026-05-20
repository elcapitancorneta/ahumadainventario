import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Iniciando sembrado de base de datos...");

  // Limpiar base de datos
  await prisma.historialReparacion.deleteMany();
  await prisma.dispositivo.deleteMany();
  await prisma.trabajador.deleteMany();
  await prisma.componente.deleteMany();

  // 1. Crear Trabajadores
  console.log("Creando trabajadores...");
  const t1 = await prisma.trabajador.create({
    data: {
      rut: "12.345.678-9",
      nombre: "Juan Pérez",
      cargo: "Jefe de Sistemas",
      departamento: "Sistemas",
      correo: "jperez@farmaciasahumada.cl",
    },
  });

  const t2 = await prisma.trabajador.create({
    data: {
      rut: "15.987.654-3",
      nombre: "María González",
      cargo: "Analista de Finanzas",
      departamento: "Finanzas",
      correo: "mgonzalez@farmaciasahumada.cl",
    },
  });

  const t3 = await prisma.trabajador.create({
    data: {
      rut: "18.123.456-k",
      nombre: "Carlos Muñoz",
      cargo: "Ejecutivo de Soporte",
      departamento: "Sistemas",
      correo: "cmunoz@farmaciasahumada.cl",
    },
  });

  const t4 = await prisma.trabajador.create({
    data: {
      rut: "16.754.321-0",
      nombre: "Ana Silva",
      cargo: "Coordinadora de Recursos Humanos",
      departamento: "Recursos Humanos",
      correo: "asilva@farmaciasahumada.cl",
    },
  });

  // 2. Crear Componentes (Repuestos en bodega)
  console.log("Creando componentes en stock...");
  await prisma.componente.createMany({
    data: [
      { nombre: "Disco Estado Sólido SSD 480GB Kingston", tipo: "Almacenamiento", cantidadDisponible: 8, ubicacion: "Bodega Soporte Central" },
      { nombre: "Disco SSD M.2 NVMe 1TB Crucial", tipo: "Almacenamiento", cantidadDisponible: 5, ubicacion: "Bodega Soporte Central" },
      { nombre: "Memoria RAM DDR4 8GB Kingston Sodimm", tipo: "Memoria RAM", cantidadDisponible: 12, ubicacion: "Bodega Soporte Central" },
      { nombre: "Memoria RAM DDR4 16GB Corsair Vengeance", tipo: "Memoria RAM", cantidadDisponible: 6, ubicacion: "Bodega Soporte Central" },
      { nombre: "Teclado USB Logitech K120", tipo: "Periférico", cantidadDisponible: 15, ubicacion: "Bodega Soporte Central" },
      { nombre: "Mouse USB Optico Genius", tipo: "Periférico", cantidadDisponible: 20, ubicacion: "Bodega Soporte Central" },
      { nombre: "Cargador Notebook Lenovo Thinkpad 65W Tipo-C", tipo: "Cargador", cantidadDisponible: 7, ubicacion: "Bodega Soporte Central" },
    ],
  });

  // 3. Crear Dispositivos
  console.log("Creando dispositivos...");
  
  // Computador 1 (Asignado a Juan)
  const d1 = await prisma.dispositivo.create({
    data: {
      tipo: "COMPUTADOR",
      marca: "Lenovo",
      modelo: "ThinkPad L14 Gen 3",
      numeroSerie: "SPF1234567A",
      codigoInventario: "INV-COMP-001",
      estado: "OPERATIVO",
      detallesTecnicos: JSON.stringify({
        procesador: "Intel Core i5-1235U",
        ram: "16 GB DDR4",
        almacenamiento: "512 GB SSD NVMe",
        so: "Windows 11 Pro",
        ip: "192.168.10.45",
      }),
      trabajadorId: t1.id,
      ubicacion: "Oficinas Centrales - Piso 3",
      comentarios: "Equipo entregado nuevo en marzo 2024.",
    },
  });

  // Computador 2 (Asignado a María)
  const d2 = await prisma.dispositivo.create({
    data: {
      tipo: "COMPUTADOR",
      marca: "HP",
      modelo: "ProBook 440 G9",
      numeroSerie: "5CD2345678",
      codigoInventario: "INV-COMP-002",
      estado: "OPERATIVO",
      detallesTecnicos: JSON.stringify({
        procesador: "Intel Core i5-1235U",
        ram: "8 GB DDR4",
        almacenamiento: "256 GB SSD",
        so: "Windows 11 Pro",
        ip: "192.168.10.72",
      }),
      trabajadorId: t2.id,
      ubicacion: "Oficinas Centrales - Finanzas",
      comentarios: "Requiere ampliación de RAM a 16GB en el futuro.",
    },
  });

  // Computador 3 (En Bodega)
  const d3 = await prisma.dispositivo.create({
    data: {
      tipo: "COMPUTADOR",
      marca: "Dell",
      modelo: "Latitude 3420",
      numeroSerie: "CN-0F1234-5678",
      codigoInventario: "INV-COMP-003",
      estado: "BODEGA",
      detallesTecnicos: JSON.stringify({
        procesador: "Intel Core i3-1115G4",
        ram: "8 GB DDR4",
        almacenamiento: "256 GB SSD",
        so: "Windows 10 Pro",
      }),
      ubicacion: "Bodega Soporte Central",
      comentarios: "Equipo retornado por término de contrato laboral.",
    },
  });

  // Monitor 1 (Asignado a Juan)
  await prisma.dispositivo.create({
    data: {
      tipo: "MONITOR",
      marca: "Dell",
      modelo: "P2422H 24\"",
      numeroSerie: "MX054321A",
      codigoInventario: "INV-MON-001",
      estado: "OPERATIVO",
      detallesTecnicos: JSON.stringify({
        resolucion: "1920x1080 (FHD)",
        puertos: "HDMI, DisplayPort, VGA",
      }),
      trabajadorId: t1.id,
      ubicacion: "Oficinas Centrales - Piso 3",
    },
  });

  // Monitor 2 (En Reparación)
  const dMonitorRep = await prisma.dispositivo.create({
    data: {
      tipo: "MONITOR",
      marca: "Samsung",
      modelo: "F390 27\" Curvo",
      numeroSerie: "LS27F390FHN",
      codigoInventario: "INV-MON-002",
      estado: "REPARACION",
      detallesTecnicos: JSON.stringify({
        resolucion: "1920x1080",
        panel: "VA Curvo",
      }),
      ubicacion: "Taller Soporte Externo",
      comentarios: "Parpadeo de luz LED y líneas verticales en pantalla.",
    },
  });

  // Impresora 1 (Red / Zebra para etiquetas en sucursal)
  await prisma.dispositivo.create({
    data: {
      tipo: "IMPRESORA",
      marca: "Zebra",
      modelo: "ZD220 (Etiquetas)",
      numeroSerie: "Z123456789",
      codigoInventario: "INV-IMP-001",
      estado: "OPERATIVO",
      detallesTecnicos: JSON.stringify({
        tipoConexion: "Red (Ethernet)",
        ip: "192.168.1.150",
        toner_cinta: "Ribbon cera 110x74",
      }),
      ubicacion: "Sucursal Providencia - Mesón de Atención",
      comentarios: "Impresora de recetas y etiquetas de código de barras.",
    },
  });

  // Impresora 2 (Multifuncional de Oficina)
  await prisma.dispositivo.create({
    data: {
      tipo: "IMPRESORA",
      marca: "HP",
      modelo: "LaserJet Pro M404dn",
      numeroSerie: "PH123456BC",
      codigoInventario: "INV-IMP-002",
      estado: "OPERATIVO",
      detallesTecnicos: JSON.stringify({
        tipoConexion: "Red (Ethernet)",
        ip: "192.168.10.15",
        toner_cinta: "HP 58A (CF258A)",
      }),
      ubicacion: "Oficinas Centrales - Pasillo Piso 3",
      comentarios: "Impresora compartida para el departamento de Sistemas y Finanzas.",
    },
  });

  // Teléfono 1 (IP asignado a Juan)
  await prisma.dispositivo.create({
    data: {
      tipo: "TELEFONO",
      marca: "Yealink",
      modelo: "SIP-T31P",
      numeroSerie: "YL12345678",
      codigoInventario: "INV-TEL-001",
      estado: "OPERATIVO",
      detallesTecnicos: JSON.stringify({
        anexo: "3001",
        ip: "192.168.10.101",
        poe: "Sí",
      }),
      trabajadorId: t1.id,
      ubicacion: "Oficinas Centrales - Escritorio 301",
    },
  });

  // Teléfono 2 (IP asignado a Ana)
  await prisma.dispositivo.create({
    data: {
      tipo: "TELEFONO",
      marca: "Cisco",
      modelo: "SPA303-G1",
      numeroSerie: "CC12345678",
      codigoInventario: "INV-TEL-002",
      estado: "OPERATIVO",
      detallesTecnicos: JSON.stringify({
        anexo: "3004",
        ip: "192.168.10.104",
        poe: "No (Usa adaptador 5V)",
      }),
      trabajadorId: t4.id,
      ubicacion: "Oficinas Centrales - Escritorio Recursos Humanos",
    },
  });

  // 4. Historial de Reparaciones
  console.log("Creando registros de reparación...");
  
  // Reparación terminada del PC de Juan (d1)
  await prisma.historialReparacion.create({
    data: {
      dispositivoId: d1.id,
      fechaEnvio: new Date("2024-01-10"),
      fechaRetorno: new Date("2024-01-12"),
      descripcionFalla: "Pantallazo azul (BSOD) intermitente.",
      solucion: "Se reemplazó módulo de memoria RAM defectuoso de 8GB por uno nuevo de 16GB. Limpieza interna.",
      costo: 35000,
      tecnicoEncargado: "Carlos Muñoz (Soporte Interno)",
      estado: "RESUELTO",
    },
  });

  // Reparación activa del monitor Samsung (dMonitorRep)
  await prisma.historialReparacion.create({
    data: {
      dispositivoId: dMonitorRep.id,
      fechaEnvio: new Date("2026-05-10"),
      descripcionFalla: "Monitor parpadea y muestra líneas horizontales verdes.",
      tecnicoEncargado: "Servicio Técnico Computec Ltda.",
      estado: "EN_PROCESO",
    },
  });

  console.log("¡Base de datos sembrada con éxito!");
}

main()
  .catch((e) => {
    console.error("Error al sembrar base de datos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
