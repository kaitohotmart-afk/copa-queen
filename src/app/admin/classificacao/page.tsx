"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Team = {
    id: string;
    name: string;
    tag: string;
    booyahs: number;
    team_kills: number;
    penalty_points: number;
    total_points: number;
    groups?: { name: string } | { name: string }[];
};

function getRankClass(rank: number): string {
    if (rank === 1) return "rank rank-1";
    if (rank === 2) return "rank rank-2";
    if (rank === 3) return "rank rank-3";
    return "rank";
}

export default function AdminClassificacaoPage() {
    const [activeTab, setActiveTab] = useState("GERAL");
    const [standings, setStandings] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStandings();
    }, []);

    const fetchStandings = async () => {
        try {
            const { data, error } = await supabase
                .from("teams")
                .select(`
                    id, 
                    name, 
                    tag, 
                    booyahs, 
                    team_kills, 
                    penalty_points,
                    total_points,
                    groups (
                        name
                    )
                `)
                .order("total_points", { ascending: false })
                .order("booyahs", { ascending: false })
                .order("team_kills", { ascending: false });

            if (error) throw error;
            setStandings((data as any) || []);
        } catch (error) {
            console.error("Erro ao buscar classificação:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredStandings = activeTab === "GERAL"
        ? standings
        : standings.filter(team => {
            const gName = Array.isArray(team.groups) ? team.groups[0]?.name : team.groups?.name;
            return gName === activeTab;
        });

    if (isLoading) {
        return <div style={{ padding: "4rem", textAlign: "center" }}>Carregando classificação...</div>;
    }

    const tabs = ["GERAL", "GRUPO A", "GRUPO B", "GRUPO C", "GRUPO D"];

    return (
        <div>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Classificação Geral</h1>
                <p style={{ color: "var(--text-secondary)" }}>
                    Visualize a classificação atual da Copa Queen Season 4 por grupos ou geral.
                </p>
            </div>

            <div style={{ paddingBottom: "4rem" }}>
                {/* Tabs */}
                <div
                    style={{
                        display: "flex",
                        gap: "0.5rem",
                        marginBottom: "1.5rem",
                        overflowX: "auto",
                        paddingBottom: "0.5rem",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none"
                    }}
                >
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`btn ${activeTab === tab ? "btn-primary" : "btn-secondary"}`}
                            style={{
                                padding: "0.5rem 1.25rem",
                                whiteSpace: "nowrap",
                                fontSize: "0.813rem",
                                fontWeight: 700,
                                borderRadius: "0.5rem"
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

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

                {/* Table */}
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "80px" }}>Posição</th>
                                    <th>Equipa</th>
                                    <th style={{ textAlign: "center" }}>🏆 BOOYAH</th>
                                    <th style={{ textAlign: "center" }}>🔫 Kills</th>
                                    <th style={{ textAlign: "center" }}>❌ Punição</th>
                                    <th style={{ textAlign: "center" }}>⭐ Pontos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStandings.map((team, index) => (
                                    <tr key={team.id}>
                                        <td>
                                            <div className={getRankClass(index + 1)}>
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>
                                                {team.name}
                                                {activeTab === "GERAL" && team.groups && (
                                                    <span style={{
                                                        marginLeft: "0.5rem",
                                                        fontSize: "0.7rem",
                                                        color: "var(--purple)",
                                                        fontWeight: 600
                                                    }}>
                                                        [{Array.isArray(team.groups) ? team.groups[0]?.name : team.groups.name}]
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--purple)" }}>[{team.tag}]</div>
                                        </td>
                                        <td style={{ textAlign: "center", fontWeight: 600, fontSize: "1.125rem" }}>
                                            {team.booyahs}
                                        </td>
                                        <td style={{ textAlign: "center", fontWeight: 600, fontSize: "1.125rem" }}>
                                            {team.team_kills}
                                        </td>
                                        <td style={{ textAlign: "center", fontWeight: 600, fontSize: "1.125rem", color: team.penalty_points > 0 ? "#ef4444" : "var(--text-muted)" }}>
                                            {team.penalty_points > 0 ? `-${team.penalty_points}` : "0"}
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
                                {filteredStandings.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--text-secondary)" }}>
                                            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏆</div>
                                            Nenhuma equipa nesta classificação ainda.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
