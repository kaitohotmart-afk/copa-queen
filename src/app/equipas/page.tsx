"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { StatusBadge } from "@/components/StatusBadge";

type Team = {
    id: string;
    name: string;
    tag: string;
    status: "pending" | "confirmed" | "rejected";
    players: {
        name: string;
        is_reserve: boolean;
    }[];
};

export default function EquipasPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const { data, error } = await supabase
                .from("teams")
                .select(`
                    id,
                    name,
                    tag,
                    status,
                    players (
                        name,
                        is_reserve
                    )
                `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setTeams(data || []);
        } catch (error) {
            console.error("Erro ao buscar equipas:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const confirmedTeams = teams.filter((t) => t.status === "confirmed").length;
    const pendingTeams = teams.filter((t) => t.status === "pending").length;

    if (isLoading) {
        return <div style={{ padding: "4rem", textAlign: "center" }}>Carregando equipas...</div>;
    }

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Equipas Inscritas</h1>
                <p className="page-subtitle">
                    {teams.length} equipas inscritas • {confirmedTeams} confirmadas • {pendingTeams} pendentes
                </p>
            </div>

            <div className="container" style={{ paddingBottom: "4rem" }}>
                <div className="teams-grid">
                    {teams.map((team) => (
                        <div key={team.id} className="team-card">
                            <div className="team-header">
                                <div>
                                    <div className="team-name">{team.name}</div>
                                    <div className="team-tag">[{team.tag}]</div>
                                </div>
                                <StatusBadge status={team.status} />
                            </div>

                            <div className="team-players">
                                <div
                                    style={{
                                        fontSize: "0.75rem",
                                        color: "var(--text-muted)",
                                        marginBottom: "0.5rem",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.1em",
                                    }}
                                >
                                    Jogadores ({team.players.length})
                                </div>
                                {team.players.map((player, index) => (
                                    <div key={index} className="player-item">
                                        <span className="player-name">
                                            {player.name}
                                            {player.is_reserve && (
                                                <span
                                                    style={{
                                                        marginLeft: "0.5rem",
                                                        fontSize: "0.625rem",
                                                        background: "var(--bg-darker)",
                                                        padding: "0.125rem 0.375rem",
                                                        borderRadius: "4px",
                                                        color: "var(--text-muted)",
                                                    }}
                                                >
                                                    RESERVA
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {teams.length === 0 && (
                    <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👥</div>
                        <h3>Nenhuma equipa inscrita ainda</h3>
                        <p style={{ color: "var(--text-secondary)" }}>
                            Seja o primeiro a inscrever a sua line!
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
