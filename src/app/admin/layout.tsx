"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AdminLayoutProps {
    children: React.ReactNode;
}

const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/admin/equipas", label: "Equipas", icon: "👥" },
    { href: "/admin/pontuacao", label: "Pontuação", icon: "🎯" },
    { href: "/admin/classificacao", label: "Classificação", icon: "🏆" },
    { href: "/admin/mvp", label: "MVP", icon: "⭐" },
    { href: "/admin/regulamento", label: "Regulamento", icon: "📋" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        // Check authentication
        const session = localStorage.getItem("admin_session");
        if (!session && pathname !== "/admin/login") {
            router.push("/admin/login");
        } else {
            setIsAuthenticated(true);
        }
    }, [pathname, router]);

    const handleLogout = () => {
        localStorage.removeItem("admin_session");
        router.push("/admin/login");
    };

    // Don't show sidebar on login page
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    if (!isAuthenticated) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ color: "var(--text-muted)" }}>Carregando...</div>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            {/* Mobile Header */}
            <div className="admin-mobile-header">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-primary)",
                        fontSize: "1.5rem",
                        cursor: "pointer",
                    }}
                >
                    ☰
                </button>
                <span
                    style={{
                        fontWeight: 700,
                        background: "var(--gradient-primary)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    COPA QUEEN
                </span>
                <div style={{ width: "24px" }} />
            </div>

            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="admin-sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
                <div style={{ marginBottom: "2rem" }}>
                    <Link
                        href="/admin/dashboard"
                        style={{
                            fontSize: "1.5rem",
                            fontWeight: 800,
                            background: "var(--gradient-primary)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            textDecoration: "none",
                        }}
                    >
                        COPA QUEEN
                    </Link>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                        Painel Admin
                    </div>
                </div>

                <nav style={{ flex: 1 }}>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`admin-nav-item ${pathname === item.href ? "active" : ""}`}
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1rem" }}>
                    <Link
                        href="/"
                        className="admin-nav-item"
                        style={{ color: "var(--text-muted)" }}
                    >
                        <span>🌐</span>
                        <span>Ver Site</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="admin-nav-item"
                        style={{
                            width: "100%",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--status-error)",
                        }}
                    >
                        <span>🚪</span>
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-content">
                {children}
            </main>
        </div>
    );
}
