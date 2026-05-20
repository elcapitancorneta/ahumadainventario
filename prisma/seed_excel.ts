import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';

// Load environmental variables and init Prisma client
import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

// Helper to convert Excel date values (numbers) to string date
function parseExcelDate(val: any): string | null {
  if (!val) return null;
  if (typeof val === 'number') {
    const date = new Date((val - 25569) * 86400 * 1000);
    return date.toLocaleDateString('es-CL');
  }
  return String(val).trim();
}

function cleanString(val: any): string {
  if (val === undefined || val === null) return '';
  return String(val).trim();
}

function parseNumber(val: any): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  const num = parseInt(val, 10);
  return isNaN(num) ? 0 : num;
}

function parsePrice(val: any): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

async function main() {
  console.log('--- Iniciando Sembrado de Datos desde Excel ---');
  const excelPath = path.join(__dirname, '..', 'scrap', 'Inventario2025.xlsx');
  
  const workbook = XLSX.readFile(excelPath);
  
  // 1. Clean existing records in database to avoid duplication
  console.log('Limpiando base de datos anterior...');
  await prisma.historialReparacion.deleteMany({});
  await prisma.dispositivo.deleteMany({});
  await prisma.cotizacion.deleteMany({});
  await prisma.trabajador.deleteMany({});
  
  // Create a default administrator/worker to satisfy potential constraints or references
  const mainWorker = await prisma.trabajador.create({
    data: {
      rut: '12345678-9',
      nombre: 'Administrador TI',
      cargo: 'Jefe de Infraestructura TI',
      departamento: 'Tecnología de la Información',
      correo: 'admin.ti@farmaciasahumada.cl'
    }
  });

  // ----------------------------------------------------
  // HOJA 1: Notebooks CAF
  // ----------------------------------------------------
  const sheetCaf = workbook.Sheets['Notebooks CAF'];
  if (sheetCaf) {
    const data = XLSX.utils.sheet_to_json<any>(sheetCaf);
    console.log(`Procesando Notebooks CAF (${data.length} filas)...`);
    
    for (const row of data) {
      const serial = cleanString(row['Numero de Serie']) || cleanString(row['Numero de serie']) || `CAF-NS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      await prisma.dispositivo.create({
        data: {
          tipo: 'NOTEBOOK',
          categoria: 'NOTEBOOKS_CAF',
          marca: cleanString(row['Marca']) || 'LENOVO',
          modelo: cleanString(row['Modelo']) || 'ThinkPad',
          numeroSerie: serial,
          estado: cleanString(row['Estado']) || cleanString(row['Estado_1']) || 'OPERATIVO',
          ubicacion: cleanString(row['Ubicación']) || 'CAF',
          trabajadorNombre: cleanString(row['Usuario']),
          comentarios: cleanString(row['Articulos extras']),
          detallesTecnicos: JSON.stringify({
            tipoEquipo: cleanString(row['Tipo equipo']),
            uso: cleanString(row['Uso']),
            nombreEquipo: cleanString(row['nombre equipo']),
            trabajando: cleanString(row['Trabajando']),
            area: cleanString(row['Area']),
            usuarioAnterior: cleanString(row['Usuario Anterior']),
            estado_1: cleanString(row['Estado_1'])
          })
        }
      });
    }
  }

  // ----------------------------------------------------
  // HOJA 2: PC Recetario
  // ----------------------------------------------------
  const sheetRecetario = workbook.Sheets['PC Recetario'];
  if (sheetRecetario) {
    const data = XLSX.utils.sheet_to_json<any>(sheetRecetario);
    console.log(`Procesando PC Recetario (${data.length} filas)...`);
    
    for (const row of data) {
      const serial = cleanString(row['N/S']) || `REC-NS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      await prisma.dispositivo.create({
        data: {
          tipo: cleanString(row['TIPO COMPUTADOR']) || 'DESKTOP',
          categoria: 'PC_RECETARIO',
          marca: cleanString(row['MARCA']) || 'LENOVO',
          modelo: 'PC Recetario',
          numeroSerie: serial,
          estado: cleanString(row['ESTADO']) || 'OPERATIVO',
          ubicacion: `Recetario - ${cleanString(row['SECCION'])}`,
          detallesTecnicos: JSON.stringify({
            seccion: cleanString(row['SECCION']),
            nombreEquipo: cleanString(row['NOMBRE EQUIPO'])
          })
        }
      });
    }
  }

  // ----------------------------------------------------
  // HOJA 3: Notebooks Malos
  // ----------------------------------------------------
  const sheetCafMalos = workbook.Sheets['Notebooks Malos'];
  if (sheetCafMalos) {
    const data = XLSX.utils.sheet_to_json<any>(sheetCafMalos);
    console.log(`Procesando Notebooks Malos (${data.length} filas)...`);
    
    for (const row of data) {
      const serial = cleanString(row['N/S']) || `MAL-NS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      // In Excel, the brand column name has non-breaking spaces sometimes. Let's find it.
      const marcaKey = Object.keys(row).find(k => k.trim() === '') || ' ';
      await prisma.dispositivo.create({
        data: {
          tipo: 'NOTEBOOK',
          categoria: 'NOTEBOOKS_MALOS',
          marca: cleanString(row[marcaKey]) || 'LENOVO',
          modelo: cleanString(row['Modelo']),
          numeroSerie: serial,
          estado: 'MALO',
          comentarios: cleanString(row['Observaciones']),
          detallesTecnicos: JSON.stringify({
            condicion: cleanString(row['Condicion']),
            articulosFaltantes: cleanString(row['A.Faltantes']),
            estadoEstetico: cleanString(row['E.Estetico'])
          })
        }
      });
    }
  }

  // ----------------------------------------------------
  // HOJA 4: Mochilas
  // ----------------------------------------------------
  const sheetMochilas = workbook.Sheets['Mochilas'];
  if (sheetMochilas) {
    const data = XLSX.utils.sheet_to_json<any>(sheetMochilas);
    console.log(`Procesando Mochilas (${data.length} filas)...`);
    
    for (const row of data) {
      await prisma.dispositivo.create({
        data: {
          tipo: 'ACCESORIO',
          categoria: 'MOCHILAS',
          marca: cleanString(row['Marca']) || 'LENOVO',
          modelo: 'Mochila Porta Notebook',
          estado: cleanString(row['Estado']) || 'NUEVO',
          trabajadorNombre: cleanString(row['P.Asignada']),
          detallesTecnicos: JSON.stringify({
            cantidad: parseNumber(row['Cantidad']),
            area: cleanString(row['Area']),
            fechaEntrega: parseExcelDate(row['Fecha Entrega'])
          })
        }
      });
    }
  }

  // ----------------------------------------------------
  // HOJA 5: Celulares Malos
  // ----------------------------------------------------
  const sheetCelMalos = workbook.Sheets['Celulares Malos'];
  if (sheetCelMalos) {
    const data = XLSX.utils.sheet_to_json<any>(sheetCelMalos);
    console.log(`Procesando Celulares Malos (${data.length} filas)...`);
    
    for (const row of data) {
      const serial = cleanString(row['N/S']) || `CELMAL-NS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      await prisma.dispositivo.create({
        data: {
          tipo: 'CELULAR',
          categoria: 'CELULARES_MALOS',
          marca: cleanString(row['Marca']) || 'XIAOMI',
          modelo: cleanString(row['Modelo']),
          numeroSerie: serial,
          estado: 'MALO',
          comentarios: cleanString(row['Observaciones']),
          detallesTecnicos: JSON.stringify({
            condicion: cleanString(row['Condicion']),
            articulosFaltantes: cleanString(row['A.Faltantes']),
            estadoEstetico: cleanString(row['E.Estetico'])
          })
        }
      });
    }
  }

  // ----------------------------------------------------
  // HOJA 6: Celulares Entregados
  // ----------------------------------------------------
  const sheetCelEntregados = workbook.Sheets['Celulares Entregados'];
  if (sheetCelEntregados) {
    const data = XLSX.utils.sheet_to_json<any>(sheetCelEntregados);
    console.log(`Procesando Celulares Entregados (${data.length} filas)...`);
    
    for (const row of data) {
      const imei = cleanString(row['IMEI']) || `IMEI-${Math.random().toString().substring(2, 17)}`;
      await prisma.dispositivo.create({
        data: {
          tipo: 'CELULAR',
          categoria: 'CELULARES_ENTREGADOS',
          marca: cleanString(row['Marca']) || 'Apple',
          modelo: cleanString(row['Modelo']),
          numeroSerie: imei,
          estado: 'OPERATIVO',
          trabajadorNombre: cleanString(row['Nombre persona asignado']),
          comentarios: cleanString(row['Observaciones']),
          detallesTecnicos: JSON.stringify({
            numero: cleanString(row['Numero']),
            condicionChip: cleanString(row['Condicion CHIP']),
            articulosFaltantes: cleanString(row['A.Faltantes']),
            estadoEstetico: cleanString(row['E.Estetico']),
            imei: cleanString(row['IMEI'])
          })
        }
      });
    }
  }

  // ----------------------------------------------------
  // HOJA 7: Cargadores
  // ----------------------------------------------------
  const sheetCargadores = workbook.Sheets['Cargadores'];
  if (sheetCargadores) {
    const data = XLSX.utils.sheet_to_json<any>(sheetCargadores);
    console.log(`Procesando Cargadores (${data.length} filas)...`);
    
    for (const row of data) {
      const serial = cleanString(row['N/S']) || `CHG-NS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      await prisma.dispositivo.create({
        data: {
          tipo: 'ACCESORIO',
          categoria: 'CARGADORES',
          marca: 'Cargador',
          modelo: cleanString(row['Modelo']) || 'LENOVO USB-C',
          numeroSerie: serial,
          estado: cleanString(row['Condicion']) || 'OPERATIVO',
          trabajadorNombre: cleanString(row['Asignado']),
          comentarios: cleanString(row['Observaciones']),
          detallesTecnicos: JSON.stringify({
            articulosFaltantes: cleanString(row['A.Faltantes']),
            estadoEstetico: cleanString(row['E.Estetico'])
          })
        }
      });
    }
  }

  // ----------------------------------------------------
  // HOJA 8: Audifonos
  // ----------------------------------------------------
  const sheetAudifonos = workbook.Sheets['Audifonos'];
  if (sheetAudifonos) {
    const data = XLSX.utils.sheet_to_json<any>(sheetAudifonos);
    console.log(`Procesando Audifonos (${data.length} filas)...`);
    
    for (const row of data) {
      const serial = cleanString(row['N/S']) || `AUD-NS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      await prisma.dispositivo.create({
        data: {
          tipo: 'ACCESORIO',
          categoria: 'AUDIFONOS',
          marca: 'Audífonos',
          modelo: cleanString(row['Modelo']) || 'Diadema H390',
          numeroSerie: serial,
          estado: cleanString(row['Condicion']) || 'OPERATIVO',
          trabajadorNombre: cleanString(row['Asignado']),
          comentarios: cleanString(row['Observaciones']),
          detallesTecnicos: JSON.stringify({
            articulosFaltantes: cleanString(row['A.Faltantes']),
            estadoEstetico: cleanString(row['E.Estetico']),
            extra: cleanString(row['__EMPTY']) // En excel habia una columna extra "MALOS"
          })
        }
      });
    }
  }

  // ----------------------------------------------------
  // HOJA 9: Teclados+ Mouse
  // ----------------------------------------------------
  const sheetTeclados = workbook.Sheets['Teclados+ Mouse'];
  if (sheetTeclados) {
    const data = XLSX.utils.sheet_to_json<any>(sheetTeclados);
    console.log(`Procesando Teclados+Mouse (${data.length} filas)...`);
    
    for (const row of data) {
      await prisma.dispositivo.create({
        data: {
          tipo: 'ACCESORIO',
          categoria: 'TECLADOS_MOUSE',
          marca: cleanString(row['Marca']) || 'Lenovo',
          modelo: 'Combo Teclado + Mouse',
          estado: cleanString(row['Estado']) || 'NUEVO',
          trabajadorNombre: cleanString(row['P.Asignada']),
          detallesTecnicos: JSON.stringify({
            cantidad: parseNumber(row['Cantidad']),
            area: cleanString(row['Area'])
          })
        }
      });
    }
  }

  // ----------------------------------------------------
  // HOJA 10: Asus
  // ----------------------------------------------------
  const sheetAsus = workbook.Sheets['Asus'];
  if (sheetAsus) {
    const data = XLSX.utils.sheet_to_json<any>(sheetAsus);
    console.log(`Procesando Asus (${data.length} filas)...`);
    
    for (const row of data) {
      const serial = `ASUS-NS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      await prisma.dispositivo.create({
        data: {
          tipo: 'NOTEBOOK',
          categoria: 'ASUS',
          marca: cleanString(row['Marca']) || 'Asus',
          modelo: cleanString(row['Modelo']),
          codigoInventario: cleanString(row['Codigo Interno']),
          estado: cleanString(row['Estado (nuevo/usado)']),
          numeroSerie: serial,
          detallesTecnicos: JSON.stringify({
            equipo: cleanString(row['Equipo']),
            memoria: cleanString(row['Memoria']),
            disco: cleanString(row['Disco'])
          })
        }
      });
    }
  }

  // ----------------------------------------------------
  // HOJA 11: Cotizacion
  // ----------------------------------------------------
  const sheetCotizaciones = workbook.Sheets['Cotizacion'];
  if (sheetCotizaciones) {
    const data = XLSX.utils.sheet_to_json<any>(sheetCotizaciones);
    console.log(`Procesando Cotizaciones (${data.length} filas)...`);
    
    for (const row of data) {
      // Ignorar filas que no tengan descripción
      const desc = cleanString(row['Descripción ']) || cleanString(row['Descripción']);
      if (!desc) continue;
      
      await prisma.cotizacion.create({
        data: {
          cantidad: parseNumber(row['Qty. ']) || parseNumber(row['Qty.']) || 1,
          numeroParte: cleanString(row['Part number ']) || cleanString(row['Part number']),
          descripcion: desc,
          valorUnitario: parsePrice(row['Valor Unit. USD Valor']) || parsePrice(row['Valor Unit. USD']),
          valorTotal: parsePrice(row[' total USD']) || parsePrice(row['total USD'])
        }
      });
    }
  }

  // ----------------------------------------------------
  // Creación de algunos historiales de prueba para demostrar funcionalidad
  // ----------------------------------------------------
  console.log('Creando historiales de reparación de prueba...');
  const notebooks = await prisma.dispositivo.findMany({
    where: { tipo: 'NOTEBOOK' },
    take: 5
  });

  for (const nb of notebooks) {
    await prisma.historialReparacion.create({
      data: {
        dispositivoId: nb.id,
        descripcionFalla: 'Pantalla parpadea y problemas de rendimiento térmico.',
        solucion: 'Limpieza de ventiladores, cambio de pasta térmica (Artic MX-4) y ajuste de flex de pantalla.',
        costo: 35000,
        tecnicoEncargado: 'Diego Navarro (Soporte TI)',
        estado: 'RESUELTO',
        fechaEnvio: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        fechaRetorno: new Date()
      }
    });
  }

  const badNotebooks = await prisma.dispositivo.findMany({
    where: { categoria: 'NOTEBOOKS_MALOS' },
    take: 3
  });

  for (const bnb of badNotebooks) {
    await prisma.historialReparacion.create({
      data: {
        dispositivoId: bnb.id,
        descripcionFalla: 'No enciende, placa madre en cortocircuito.',
        estado: 'IRREPARABLE',
        tecnicoEncargado: 'Servicio Técnico Externo',
        fechaEnvio: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      }
    });
  }

  console.log('\n--- Sembrado Completado Correctamente ---');
  const countDispositivos = await prisma.dispositivo.count();
  const countCotizaciones = await prisma.cotizacion.count();
  console.log(`Dispositivos Totales Cargados: ${countDispositivos}`);
  console.log(`Cotizaciones Totales Cargadas: ${countCotizaciones}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
