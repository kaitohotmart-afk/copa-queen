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

type TeamRank = {
    id: string;
    name: string;
    tag: string;
    booyahs: number;
    team_kills: number;
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
    const [activeTab, setActiveTab] = useState<"players" | "teams">("players");
    const [mvpRanking, setMvpRanking] = useState<Player[]>([]);
    const [lineRanking, setLineRanking] = useState<TeamRank[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (activeTab === "players") {
            fetchMvpRanking();
        } else {
            fetchLineRanking();
        }
    }, [activeTab]);

    const fetchMvpRanking = async () => {
        setIsLoading(true);
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

    const fetchLineRanking = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from("teams")
                .select("id, name, tag, booyahs, team_kills")
                .gt("booyahs", 0)
                .order("booyahs", { ascending: false })
                .order("team_kills", { ascending: false })
                .limit(20);

            if (error) throw error;
            setLineRanking(data || []);
        } catch (error) {
            console.error("Erro ao buscar ranking de lines:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const topPlayer = mvpRanking[0];
    const topTeam = lineRanking[0];

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Ranking MVP</h1>
                <p className="page-subtitle">
                    Os maiores destaques da Copa Queen Season 4
                </p>
            </div>

            <div className="container" style={{ paddingBottom: "4rem" }}>
                {/* Custom Tabs */}
                <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
                    <button
                        onClick={() => setActiveTab("players")}
                        className={`btn ${activeTab === "players" ? "btn-primary" : "btn-secondary"}`}
                        style={{ flex: 1, padding: "0.75rem" }}
                    >
                        👤 Jogadores (Kills)
                    </button>
                    <button
                        onClick={() => setActiveTab("teams")}
                        className={`btn ${activeTab === "teams" ? "btn-primary" : "btn-secondary"}`}
                        style={{ flex: 1, padding: "0.75rem" }}
                    >
                        🔥 Lines (Booyahs)
                    </button>
                </div>

                {isLoading ? (
                    <div style={{ padding: "4rem", textAlign: "center" }}>Carregando ranking...</div>
                ) : (
                    <>
                        {/* Top Highlight Selection */}
                        {activeTab === "players" ? (
                            topPlayer && (
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
                            )
                        ) : (
                            topTeam && (
                                <div
                                    className="card animate-glow"
                                    style={{
                                        textAlign: "center",
                                        marginBottom: "2rem",
                                        background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)",
                                        border: "1px solid rgba(139, 92, 246, 0.3)"
                                    }}
                                >
                                    <div style={{ fontSize: "4rem", marginBottom: "0.5rem" }}>🔥</div>
                                    <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                                        MELHOR LINE (BOOYAHS)
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
                                        {topTeam.name}
                                    </div>
                                    <div style={{ color: "var(--purple)", marginBottom: "1rem" }}>
                                        [{topTeam.tag}]
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
                                        🏆 {topTeam.booyahs} Booyahs
                                    </div>
                                </div>
                            )
                        )}

                        {/* Ranking Table */}
                        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                            <div style={{ overflowX: "auto" }}>
                                <table className="data-table">
                                    <thead>
                                        {activeTab === "players" ? (
                                            <tr>
                                                <th style={{ width: "80px" }}>Rank</th>
                                                <th>Jogador</th>
                                                <th>Equipa</th>
                                                <th style={{ textAlign: "center" }}>🔫 Kills</th>
                                            </tr>
                                        ) : (
                                            <tr>
                                                <th style={{ width: "80px" }}>Rank</th>
                                                <th>Equipa</th>
                                                <th style={{ textAlign: "center" }}>🏆 Booyahs</th>
                                                <th style={{ textAlign: "center" }}>🔫 Kills</th>
                                            </tr>
                                        )}
                                    </thead>
                                    <tbody>
                                        {activeTab === "players" ? (
                                            mvpRanking.map((player, index) => (
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
                                            ))
                                        ) : (
                                            lineRanking.map((team, index) => (
                                                <tr key={team.id}>
                                                    <td>{getRankDisplay(index + 1)}</td>
                                                    <td>
                                                        <span style={{ fontWeight: 600 }}>{team.name}</span>
                                                        <span style={{ marginLeft: "0.5rem", color: "var(--purple)", fontSize: "0.875rem" }}>
                                                            [{team.tag}]
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: "center" }}>
                                                        <span
                                                            style={{
                                                                fontWeight: 700,
                                                                fontSize: "1.125rem",
                                                                color: index < 3 ? "var(--purple)" : "var(--text-primary)"
                                                            }}
                                                        >
                                                            {team.booyahs}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: "center", color: "var(--text-muted)" }}>
                                                        {team.team_kills}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                        {((activeTab === "players" && mvpRanking.length === 0) || (activeTab === "teams" && lineRanking.length === 0)) && (
                                            <tr>
                                                <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                                                    Nenhum registo encontrado ainda.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

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
                    {activeTab === "players" ? (
                        <>ℹ️ O ranking de MVP Jogadores conta o total de kills individuais de cada jogador.</>
                    ) : (
                        <>ℹ️ O ranking de MVP Lines (Melhor Line) é baseado no número de Booyahs. Em caso de empate, o total de kills da equipa serve como critério de desempate.</>
                    )}
                </div>
            </div>
        </>
    );
}
