"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Team = {
    id: string;
    name: string;
    tag: string;
    booyahs: number;
    team_kills: number;
    total_points: number;
};

function getRankClass(rank: number): string {
    if (rank === 1) return "rank rank-1";
    if (rank === 2) return "rank rank-2";
    if (rank === 3) return "rank rank-3";
    return "rank";
}

export default function ClassificacaoPage() {
    const [standings, setStandings] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStandings();
    }, []);

    const fetchStandings = async () => {
        try {
            const { data, error } = await supabase
                .from("teams")
                .select("id, name, tag, booyahs, team_kills, total_points")
                .order("booyahs", { ascending: false })
                .order("team_kills", { ascending: false });

            if (error) throw error;
            setStandings(data || []);
        } catch (error) {
            console.error("Erro ao buscar classificação:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div style={{ padding: "4rem", textAlign: "center" }}>Carregando classificação...</div>;
    }

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Classificação</h1>
                <p className="page-subtitle">
                    Ranking geral da Copa Queen Season 4
                </p>
            </div>

            <div className="container" style={{ paddingBottom: "4rem" }}>
                {/* Legend */}
                <div
                    style={{
                        display: "flex",
                        gap: "2rem",
                        marginBottom: "1.5rem",
                        fontSize: "0.875rem",
                        color: "var(--text-secondary)",
                        flexWrap: "wrap"
                    }}
                >
                    <span>🏆 <strong>BOOYAH</strong> - Vitórias</span>
                    <span>🔫 <strong>Kills</strong> - Abates</span>
                    <span>⭐ <strong>Pontos</strong> - Total</span>
                </div>

                {/* Scoring Info */}
                <div
                    style={{
                        marginBottom: "2rem",
                        padding: "1rem",
                        background: "var(--bg-card)",
                        borderRadius: "0.75rem",
                        fontSize: "0.875rem",
                        color: "var(--text-secondary)"
                    }}
                >
                    <strong style={{ color: "var(--purple)" }}>⚖️ Critério de Desempate:</strong>
                    <span style={{ marginLeft: "0.5rem" }}>1º Maior número de BOOYAH • 2º Maior número de Kills</span>
                </div>

                {/* Desktop Table */}
                <div className="card" style={{ padding: 0, overflow: "hidden", display: "block" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "80px" }}>Posição</th>
                                    <th>Equipa</th>
                                    <th style={{ textAlign: "center" }}>🏆 BOOYAH</th>
                                    <th style={{ textAlign: "center" }}>🔫 Kills</th>
                                    <th style={{ textAlign: "center" }}>⭐ Pontos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {standings.map((team, index) => (
                                    <tr key={team.id}>
                                        <td>
                                            <div className={getRankClass(index + 1)}>
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{team.name}</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--purple)" }}>[{team.tag}]</div>
                                        </td>
                                        <td style={{ textAlign: "center", fontWeight: 600, fontSize: "1.125rem" }}>
                                            {team.booyahs}
                                        </td>
                                        <td style={{ textAlign: "center", fontWeight: 600, fontSize: "1.125rem" }}>
                                            {team.team_kills}
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                            <span
                                                style={{
                                                    background: "var(--gradient-primary)",
                                                    WebkitBackgroundClip: "text",
                                                    WebkitTextFillColor: "transparent",
                                                    fontWeight: 700,
                                                    fontSize: "1.25rem"
                                                }}
                                            >
                                                {team.total_points}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {standings.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                                            Nenhuma equipa na classificação ainda.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Position Points Reference */}
                <div style={{ marginTop: "2rem" }}>
                    <h3 style={{ marginBottom: "1rem", fontSize: "1rem" }}>📊 Pontos por Posição</h3>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                            gap: "0.5rem"
                        }}
                    >
                        {[
                            { pos: "1º", pts: 20 },
                            { pos: "2º", pts: 17 },
                            { pos: "3º", pts: 15 },
                            { pos: "4º", pts: 13 },
                            { pos: "5º", pts: 11 },
                            { pos: "6º", pts: 9 },
                            { pos: "7º", pts: 6 },
                            { pos: "8º", pts: 5 },
                            { pos: "9º", pts: 4 },
                            { pos: "10º", pts: 3 },
                            { pos: "11º", pts: 2 },
                            { pos: "12º", pts: 1 },
                        ].map((item) => (
                            <div
                                key={item.pos}
                                style={{
                                    background: "var(--bg-card)",
                                    padding: "0.5rem",
                                    borderRadius: "0.5rem",
                                    textAlign: "center",
                                    fontSize: "0.875rem"
                                }}
                            >
                                <span style={{ color: "var(--text-muted)" }}>{item.pos}</span>
                                <span style={{ marginLeft: "0.25rem", fontWeight: 600 }}>{item.pts} pts</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
