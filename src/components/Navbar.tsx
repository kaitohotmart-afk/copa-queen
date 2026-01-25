"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const navLinks = [
    { href: "/", label: "Início" },
    { href: "/equipas", label: "Equipas" },
    { href: "/classificacao", label: "Classificação" },
    { href: "/mvp", label: "MVP" },
    { href: "/regulamento", label: "Regulamento" },
];

export function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Don't show navbar on admin pages
    if (pathname?.startsWith("/admin")) {
        return null;
    }

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link href="/" className="nav-logo">
                    COPA QUEEN
                </Link>

                <ul className="nav-links">
                    {navLinks.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className={`nav-link ${pathname === link.href ? "active" : ""}`}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                    <li>
                        <Link href="/inscricao" className="btn btn-primary" style={{ padding: "0.5rem 1.25rem" }}>
                            Inscrever-se
                        </Link>
                    </li>
                </ul>

                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Menu"
                >
                    {isOpen ? "✕" : "☰"}
                </button>
            </div>

            {/* Mobile Menu Portal */}
            {mounted && isOpen && createPortal(
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "#0A0A0F", // Solid background color
                        padding: "2rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.5rem",
                        zIndex: 99999, // Very high z-index
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: "none",
                                border: "none",
                                color: "var(--text-primary)",
                                fontSize: "2rem",
                                cursor: "pointer",
                                padding: "0.5rem",
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            style={{
                                color: pathname === link.href ? "var(--cyan)" : "var(--text-primary)",
                                textDecoration: "none",
                                fontSize: "1.5rem",
                                fontWeight: 600,
                                padding: "1rem 0",
                                borderBottom: "1px solid rgba(255,255,255,0.05)",
                                textAlign: "center",
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link
                        href="/inscricao"
                        onClick={() => setIsOpen(false)}
                        className="btn btn-primary"
                        style={{ marginTop: "1rem", padding: "1rem", fontSize: "1.125rem" }}
                    >
                        Inscrever-se
                    </Link>
                </div>,
                document.body
            )}
        </nav>
    );
}
