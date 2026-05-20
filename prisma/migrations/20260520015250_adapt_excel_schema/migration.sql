-- CreateTable
CREATE TABLE "Cotizacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cantidad" INTEGER NOT NULL,
    "numeroParte" TEXT,
    "descripcion" TEXT NOT NULL,
    "valorUnitario" REAL,
    "valorTotal" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Dispositivo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "marca" TEXT,
    "modelo" TEXT,
    "numeroSerie" TEXT,
    "codigoInventario" TEXT,
    "estado" TEXT,
    "detallesTecnicos" TEXT,
    "categoria" TEXT,
    "trabajadorNombre" TEXT,
    "trabajadorId" TEXT,
    "ubicacion" TEXT,
    "fechaIngreso" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comentarios" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Dispositivo_trabajadorId_fkey" FOREIGN KEY ("trabajadorId") REFERENCES "Trabajador" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Dispositivo" ("codigoInventario", "comentarios", "createdAt", "detallesTecnicos", "estado", "fechaIngreso", "id", "marca", "modelo", "numeroSerie", "tipo", "trabajadorId", "ubicacion", "updatedAt") SELECT "codigoInventario", "comentarios", "createdAt", "detallesTecnicos", "estado", "fechaIngreso", "id", "marca", "modelo", "numeroSerie", "tipo", "trabajadorId", "ubicacion", "updatedAt" FROM "Dispositivo";
DROP TABLE "Dispositivo";
ALTER TABLE "new_Dispositivo" RENAME TO "Dispositivo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
