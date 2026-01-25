"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Player = {
    id: string;
    name: string;
    kills: number;
    team: {
        name: string;
        tag: string;
    };
};

function getRankDisplay(rank: number): React.ReactNode {
    if (rank === 1) {
        return (
            <div className="rank rank-1">
                👑
            </div>
        );
    }
    if (rank === 2) {
        return <div className="rank rank-2">{rank}</div>;
    }
    if (rank === 3) {
        return <div className="rank rank-3">{rank}</div>;
    }
    return <div className="rank">{rank}</div>;
}

export default function MVPPage() {
    const [mvpRanking, setMvpRanking] = useState<Player[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMvpRanking();
    }, []);

    const fetchMvpRanking = async () => {
        try {
            const { data, error } = await supabase
                .from("players")
                .select(`
                    id,
                    name,
                    kills,
                    team:teams (
                        name,
                        tag
                    )
                `)
                .gt("kills", 0)
                .order("kills", { ascending: false })
                .limit(50);

            if (error) throw error;

            // Transform data
            const formattedPlayers = data?.map(p => ({
                id: p.id,
                name: p.name,
                kills: p.kills,
                team: Array.isArray(p.team) ? p.team[0] : p.team
            })) || [];

            setMvpRanking(formattedPlayers);
        } catch (error) {
            console.error("Erro ao buscar ranking MVP:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const topPlayer = mvpRanking[0];

    if (isLoading) {
        return <div style={{ padding: "4rem", textAlign: "center" }}>Carregando ranking...</div>;
    }

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Ranking MVP</h1>
                <p className="page-subtitle">
                    Os jogadores com mais kills da Copa Queen
                </p>
            </div>

            <div className="container" style={{ paddingBottom: "4rem" }}>
                {/* Top MVP Highlight */}
                {topPlayer && (
                    <div
                        className="card animate-glow"
                        style={{
                            textAlign: "center",
                            marginBottom: "2rem",
                            background: "linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
                            border: "1px solid rgba(255, 215, 0, 0.3)"
                        }}
                    >
                        <div style={{ fontSize: "4rem", marginBottom: "0.5rem" }}>👑</div>
                        <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                            MVP ATUAL
                        </div>
                        <div
                            style={{
                                fontSize: "2rem",
                                fontWeight: 700,
                                background: "var(--gradient-primary)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent"
                            }}
                        >
                            {topPlayer.name}
                        </div>
                        <div style={{ color: "var(--purple)", marginBottom: "1rem" }}>
                            {topPlayer.team.name} [{topPlayer.team.tag}]
                        </div>
                        <div
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                background: "var(--bg-darker)",
                                padding: "0.75rem 1.5rem",
                                borderRadius: "9999px",
                                fontSize: "1.25rem",
                                fontWeight: 700
                            }}
                        >
                            🔫 {topPlayer.kills} kills
                        </div>
                    </div>
                )}

                {/* MVP Table */}
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "80px" }}>Rank</th>
                                    <th>Jogador</th>
                                    <th>Equipa</th>
                                    <th style={{ textAlign: "center" }}>🔫 Kills</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mvpRanking.map((player, index) => (
                                    <tr key={player.id}>
                                        <td>{getRankDisplay(index + 1)}</td>
                                        <td>
                                            <span style={{ fontWeight: 600 }}>{player.name}</span>
                                        </td>
                                        <td>
                                            <span style={{ color: "var(--text-secondary)" }}>{player.team.name}</span>
                                            <span style={{ marginLeft: "0.5rem", color: "var(--purple)", fontSize: "0.875rem" }}>
                                                [{player.team.tag}]
                                            </span>
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                            <span
                                                style={{
                                                    fontWeight: 700,
                                                    fontSize: "1.125rem",
                                                    color: index < 3 ? "var(--cyan)" : "var(--text-primary)"
                                                }}
                                            >
                                                {player.kills}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {mvpRanking.length === 0 && (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                                            Nenhum jogador pontuou ainda.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Info */}
                <div
                    style={{
                        marginTop: "2rem",
                        padding: "1rem",
                        background: "var(--bg-card)",
                        borderRadius: "0.75rem",
                        fontSize: "0.875rem",
                        color: "var(--text-secondary)",
                        textAlign: "center"
                    }}
                >
                    ℹ️ O ranking é atualizado automaticamente após cada rodada.
                    Cada kill conta como 1 ponto para o jogador e para a equipa.
                </div>
            </div>
        </>
    );
}
