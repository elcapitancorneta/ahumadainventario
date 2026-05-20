import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import AccessControl from "@/components/AccessControl";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Inventario TI | Farmacias Ahumada",
  description: "Sistema de gestión y control de inventario tecnológico y reparaciones de Farmacias Ahumada.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <div className="layout-container">
          {/* Sidebar Nav */}
          <aside className="sidebar">
            <div className="sidebar-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <img src="/logo.svg" alt="Farmacias Ahumada Logo" className="logo-svg-img" style={{ height: "35px", width: "auto", display: "block" }} />
                <div className="logo-text">
                  <span className="logo-brand">Ahumada</span>
                  <span className="logo-sub">Inventario TI</span>
                </div>
              </div>
              <ThemeToggle />
            </div>
            
            <nav className="sidebar-nav">
              <Link href="/" className="nav-item">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="9" />
                  <rect x="14" y="3" width="7" height="5" />
                  <rect x="14" y="12" width="7" height="9" />
                  <rect x="3" y="16" width="7" height="5" />
                </svg>
                <span>Dashboard</span>
              </Link>
              
              <Link href="/inventario" className="nav-item">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                <span>Inventario TI</span>
              </Link>
              
              <Link href="/componentes" className="nav-item">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                <span>Componentes</span>
              </Link>
              
              <Link href="/trabajadores" className="nav-item">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>Trabajadores</span>
              </Link>
              
              <Link href="/reparaciones" className="nav-item">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
                <span>Reparaciones</span>
              </Link>

              <Link href="/estadisticas" className="nav-item">
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                <span>Estadísticas</span>
              </Link>
            </nav>


            <AccessControl />
          </aside>

          {/* Main workspace */}
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
