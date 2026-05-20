import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("--- Iniciando Vinculación de Trabajadores y Componentes ---");

  // 1. Get all devices with a flat worker name
  const devices = await prisma.dispositivo.findMany({
    where: {
      trabajadorNombre: {
        not: null,
      },
    },
  });

  console.log(`Encontrados ${devices.length} dispositivos con nombres de trabajadores.`);

  // Set of invalid names that represent stock or bodega instead of real workers
  const invalidNames = new Set([
    "",
    "stock",
    "bodega",
    "bodega reci",
    "disponible",
    "prestamo",
    "préstamo",
    "malogrado",
    "malo",
    "de baja",
    "sin asignar",
    "dnavarro",
    "soporte ti",
    "administrador ti",
  ]);

  let rutCounter = 13540210; // Start range for dummy RUTs

  for (const device of devices) {
    const rawName = device.trabajadorNombre ? device.trabajadorNombre.trim() : "";
    const cleanName = rawName.toLowerCase();

    // Skip if empty or matches bodega/stock tags
    if (!rawName || invalidNames.has(cleanName) || cleanName.includes("bodega") || cleanName.includes("stock")) {
      continue;
    }

    // Try to find if this worker already exists
    let worker = await prisma.trabajador.findFirst({
      where: {
        nombre: {
          equals: rawName,
        },
      },
    });

    if (!worker) {
      // Generate a realistic RUT
      rutCounter += 7; // Increment to prevent duplicate RUTs
      const run = rutCounter.toString();
      // Calculate simple mod 11 verifier digit for RUT
      let sum = 0;
      let multiplier = 2;
      for (let i = run.length - 1; i >= 0; i--) {
        sum += parseInt(run.charAt(i), 10) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
      }
      const rest = 11 - (sum % 11);
      let dv = rest === 11 ? "0" : rest === 10 ? "K" : rest.toString();
      const formattedRut = `${run.substring(0, 2)}.${run.substring(2, 5)}.${run.substring(5, 8)}-${dv}`;

      // Generate a realistic email
      const nameParts = rawName.split(" ");
      const firstName = nameParts[0]?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "usuario";
      const lastName = nameParts[1]?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "ti";
      const email = `${firstName}.${lastName}@farmaciasahumada.cl`;

      // Determine typical department and role based on device category
      let cargo = "Funcionario Operativo";
      let depto = "Operaciones";

      if (device.categoria === "PC_RECETARIO") {
        cargo = "Auxiliar de Recetario";
        depto = "Recetario Ahumada";
      } else if (device.categoria === "NOTEBOOKS_CAF") {
        cargo = "Analista de Administración";
        depto = "Centro de Apoyo Farmacéutico (CAF)";
      } else if (device.categoria === "CELULARES_ENTREGADOS") {
        cargo = "Ejecutivo Comercial";
        depto = "Ventas / Negocios";
      }

      // Create worker
      try {
        worker = await prisma.trabajador.create({
          data: {
            nombre: rawName,
            rut: formattedRut,
            cargo,
            departamento: depto,
            correo: email,
          },
        });
        console.log(`[Trabajador Creado]: ${worker.nombre} - RUT: ${worker.rut}`);
      } catch (err) {
        // Fallback if RUT or unique constraint collisions occur
        console.error(`Error creando trabajador: ${rawName}`, err);
        continue;
      }
    }

    // Link device to this worker
    if (worker) {
      await prisma.dispositivo.update({
        where: { id: device.id },
        data: {
          trabajadorId: worker.id,
        },
      });
    }
  }

  // 2. Clear and Seed Components
  console.log("Limpiando componentes antiguos...");
  await prisma.componente.deleteMany({});

  const componentsToSeed = [
    { nombre: "Memoria RAM DDR4 8GB Crucial 3200MHz", tipo: "RAM", cantidadDisponible: 15, ubicacion: "Bodega Central" },
    { nombre: "Memoria RAM DDR4 16GB Kingston Fury", tipo: "RAM", cantidadDisponible: 12, ubicacion: "Bodega Central" },
    { nombre: "Disco SSD 240GB Kingston A400 SATA", tipo: "Almacenamiento", cantidadDisponible: 24, ubicacion: "Bodega Recetario" },
    { nombre: "Disco SSD 480GB Kingston A400 SATA", tipo: "Almacenamiento", cantidadDisponible: 10, ubicacion: "Bodega Central" },
    { nombre: "Disco SSD NVMe 500GB Crucial P3 PCIe 3.0", tipo: "Almacenamiento", cantidadDisponible: 18, ubicacion: "Bodega Central" },
    { nombre: "Disco SSD NVMe 1TB Samsung 980 EVO", tipo: "Almacenamiento", cantidadDisponible: 8, ubicacion: "Bodega Central" },
    { nombre: "Teclado USB Español Lenovo Original", tipo: "Periférico", cantidadDisponible: 30, ubicacion: "Bodega Central" },
    { nombre: "Mouse Óptico USB Lenovo Original", tipo: "Periférico", cantidadDisponible: 35, ubicacion: "Bodega Central" },
    { nombre: "Diadema USB Logitech H390 con Micrófono", tipo: "Periférico", cantidadDisponible: 10, ubicacion: "Bodega Central" },
    { nombre: "Adaptador Convertidor HDMI a VGA Activo", tipo: "Adaptador", cantidadDisponible: 25, ubicacion: "Bodega Recetario" },
    { nombre: "Cargador Lenovo 65W USB-C Original", tipo: "Cargador", cantidadDisponible: 14, ubicacion: "Bodega Central" },
    { nombre: "Cargador Asus VivoBook 45W Plug", tipo: "Cargador", cantidadDisponible: 7, ubicacion: "Bodega Central" },
    { nombre: "Cable de Red RJ45 Cat6 3 Metros", tipo: "Redes", cantidadDisponible: 50, ubicacion: "Bodega Central" },
  ];

  console.log("Sembrando componentes...");
  for (const comp of componentsToSeed) {
    const created = await prisma.componente.create({
      data: comp,
    });
    console.log(`[Componente Creado]: ${created.nombre} - Stock: ${created.cantidadDisponible}`);
  }

  console.log("--- Vinculación e Inserción Completada Exitosamente ---");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
