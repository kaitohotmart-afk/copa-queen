"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";

interface TableExportProps {
    title: string;
    children: React.ReactNode;
}

export function TableExport({ title, children }: TableExportProps) {
    const tableRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    const exportAsImage = async (format: "png" | "jpeg") => {
        if (!tableRef.current) return;
        setIsExporting(true);

        try {
            const canvas = await html2canvas(tableRef.current, {
                backgroundColor: "#0a0a0f",
                scale: 2,
                logging: false,
                useCORS: true,
            });

            const link = document.createElement("a");
            link.download = `copa-queen-${title.toLowerCase().replace(/\s+/g, "-")}.${format === "jpeg" ? "jpg" : "png"}`;
            link.href = canvas.toDataURL(`image/${format}`, 0.95);
            link.click();
        } catch (error) {
            console.error("Erro ao exportar:", error);
            alert("Erro ao exportar imagem.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div>
            {/* Export Buttons */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                <button
                    onClick={() => exportAsImage("png")}
                    disabled={isExporting}
                    className="btn btn-secondary"
                    style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                >
                    {isExporting ? "⏳ Exportando..." : "📷 Exportar PNG"}
                </button>
                <button
                    onClick={() => exportAsImage("jpeg")}
                    disabled={isExporting}
                    className="btn btn-secondary"
                    style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                >
                    {isExporting ? "⏳ Exportando..." : "🖼️ Exportar JPG"}
                </button>
            </div>

            {/* Exportable Content */}
            <div
                ref={tableRef}
                style={{
                    background: "linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)",
                    padding: "2rem",
                    borderRadius: "1rem",
                }}
            >
                {/* Header with Branding */}
                <div
                    style={{
                        textAlign: "center",
                        marginBottom: "1.5rem",
                        paddingBottom: "1rem",
                        borderBottom: "1px solid rgba(139, 92, 246, 0.3)",
                    }}
                >
                    <div
                        style={{
                            fontSize: "1.5rem",
                            fontWeight: 800,
                            background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            marginBottom: "0.25rem",
                        }}
                    >
                        🏆 COPA QUEEN
                    </div>
                    <div style={{ color: "#a1a1aa", fontSize: "0.875rem" }}>
                        Season 4 • {title}
                    </div>
                </div>

                {/* Table Content */}
                {children}

                {/* Footer */}
                <div
                    style={{
                        textAlign: "center",
                        marginTop: "1.5rem",
                        paddingTop: "1rem",
                        borderTop: "1px solid rgba(139, 92, 246, 0.3)",
                        color: "#71717a",
                        fontSize: "0.75rem",
                    }}
                >
                    OFF QUEEN • OFF MORENA • DP CORONA • WARLOCK RIP
                </div>
            </div>
        </div>
    );
}
