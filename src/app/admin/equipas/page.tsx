"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Player = {
    name: string;
    is_reserve: boolean;
};

type Team = {
    id: string;
    name: string;
    tag: string;
    status: "pending" | "confirmed" | "rejected";
    created_at: string;
    players: Player[];
};

export default function AdminEquipasPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [filter, setFilter] = useState<"all" | "confirmed" | "pending">("all");
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [showModal, setShowModal] = useState(false);
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
                    created_at,
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

    const filteredTeams = teams.filter((team) => {
        if (filter === "all") return true;
        return team.status === filter;
    });

    const updateStatus = async (teamId: string, newStatus: "pending" | "confirmed" | "rejected") => {
        try {
            const { error } = await supabase
                .from("teams")
                .update({ status: newStatus })
                .eq("id", teamId);

            if (error) throw error;

            setTeams(
                teams.map((team) =>
                    team.id === teamId ? { ...team, status: newStatus } : team
                )
            );

            if (selectedTeam?.id === teamId) {
                setSelectedTeam({ ...selectedTeam, status: newStatus });
            }
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            alert("Erro ao atualizar status.");
        }
    };

    const deleteTeam = async (teamId: string) => {
        try {
            const { error } = await supabase
                .from("teams")
                .delete()
                .eq("id", teamId);

            if (error) {
                console.error("Supabase Error:", error);
                throw error;
            }

            setTeams(teams.filter((t) => t.id !== teamId));
            setShowModal(false);
            setSelectedTeam(null);
            alert("Equipa removida com sucesso!");
        } catch (error: any) {
            console.error("Erro ao remover equipa:", error);
            alert(`Erro ao remover equipa: ${error.message || "Erro desconhecido"}`);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
    };

    const openDetails = (team: Team) => {
        setSelectedTeam(team);
        setShowModal(true);
    };

    if (isLoading) {
        return <div style={{ padding: "2rem", textAlign: "center" }}>Carregando equipas...</div>;
    }

    return (
        <div>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Gestão de Equipas</h1>
                <p style={{ color: "var(--text-secondary)" }}>{teams.length} equipas inscritas</p>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                <button
                    onClick={() => setFilter("all")}
                    className={`btn ${filter === "all" ? "btn-primary" : "btn-secondary"}`}
                    style={{ padding: "0.5rem 1rem" }}
                >
                    Todas ({teams.length})
                </button>
                <button
                    onClick={() => setFilter("confirmed")}
                    className={`btn ${filter === "confirmed" ? "btn-primary" : "btn-secondary"}`}
                    style={{ padding: "0.5rem 1rem" }}
                >
                    🟢 Confirmadas ({teams.filter((t) => t.status === "confirmed").length})
                </button>
                <button
                    onClick={() => setFilter("pending")}
                    className={`btn ${filter === "pending" ? "btn-primary" : "btn-secondary"}`}
                    style={{ padding: "0.5rem 1rem" }}
                >
                    🟡 Pendentes ({teams.filter((t) => t.status === "pending").length})
                </button>
            </div>

            {/* Teams Table */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Equipa</th>
                                <th>Tag</th>
                                <th>Jogadores</th>
                                <th>Status</th>
                                <th>Data</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTeams.map((team) => (
                                <tr key={team.id}>
                                    <td style={{ fontWeight: 600 }}>{team.name}</td>
                                    <td style={{ color: "var(--purple)" }}>[{team.tag}]</td>
                                    <td>{team.players.length}</td>
                                    <td>
                                        <span className={`status-badge status-${team.status}`}>
                                            {team.status === "confirmed" ? "🟢 Confirmada" : team.status === "rejected" ? "🔴 Rejeitada" : "🟡 Pendente"}
                                        </span>
                                    </td>
                                    <td style={{ color: "var(--text-muted)" }}>{formatDate(team.created_at)}</td>
                                    <td>
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <button
                                                onClick={() => openDetails(team)}
                                                className="btn btn-secondary"
                                                style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem" }}
                                            >
                                                👁️ Ver
                                            </button>
                                            {team.status === "pending" && (
                                                <button
                                                    onClick={() => updateStatus(team.id, "confirmed")}
                                                    className="btn btn-secondary"
                                                    style={{
                                                        padding: "0.375rem 0.75rem",
                                                        fontSize: "0.75rem",
                                                        background: "rgba(34, 197, 94, 0.2)",
                                                    }}
                                                >
                                                    ✅ Confirmar
                                                </button>
                                            )}
                                            {team.status === "confirmed" && (
                                                <button
                                                    onClick={() => updateStatus(team.id, "pending")}
                                                    className="btn btn-secondary"
                                                    style={{
                                                        padding: "0.375rem 0.75rem",
                                                        fontSize: "0.75rem",
                                                        background: "rgba(234, 179, 8, 0.2)",
                                                    }}
                                                >
                                                    ⏸️ Pendente
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredTeams.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                                        Nenhuma equipa encontrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Team Details Modal */}
            {showModal && selectedTeam && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "1rem",
                        zIndex: 1000,
                    }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="card"
                        style={{ maxWidth: "500px", width: "100%", maxHeight: "90vh", overflow: "auto" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                marginBottom: "1.5rem",
                            }}
                        >
                            <div>
                                <h2 style={{ marginBottom: "0.25rem" }}>{selectedTeam.name}</h2>
                                <span style={{ color: "var(--purple)" }}>[{selectedTeam.tag}]</span>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "var(--text-muted)",
                                    fontSize: "1.5rem",
                                    cursor: "pointer",
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ marginBottom: "1.5rem" }}>
                            <span className={`status-badge status-${selectedTeam.status}`}>
                                {selectedTeam.status === "confirmed" ? "🟢 Confirmada" : selectedTeam.status === "rejected" ? "🔴 Rejeitada" : "🟡 Pendente"}
                            </span>
                            <span style={{ marginLeft: "1rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                                Inscrita em {formatDate(selectedTeam.created_at)}
                            </span>
                        </div>

                        <h3 style={{ marginBottom: "1rem", fontSize: "1rem" }}>
                            👥 Jogadores ({selectedTeam.players.length})
                        </h3>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {selectedTeam.players.map((player, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        padding: "0.75rem",
                                        background: "var(--bg-darker)",
                                        borderRadius: "0.5rem",
                                    }}
                                >
                                    <div>
                                        <span style={{ fontWeight: 500 }}>{player.name}</span>
                                        {player.is_reserve && (
                                            <span
                                                style={{
                                                    marginLeft: "0.5rem",
                                                    fontSize: "0.625rem",
                                                    background: "var(--bg-card)",
                                                    padding: "0.125rem 0.375rem",
                                                    borderRadius: "4px",
                                                    color: "var(--text-muted)",
                                                }}
                                            >
                                                RESERVA
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                {selectedTeam.status === "pending" && (
                                    <button
                                        onClick={() => updateStatus(selectedTeam.id, "confirmed")}
                                        className="btn btn-primary"
                                        style={{ flex: 1 }}
                                    >
                                        ✅ Confirmar Pagamento
                                    </button>
                                )}
                                {selectedTeam.status === "confirmed" && (
                                    <button
                                        onClick={() => updateStatus(selectedTeam.id, "pending")}
                                        className="btn btn-secondary"
                                        style={{ flex: 1 }}
                                    >
                                        ⏸️ Marcar Pendente
                                    </button>
                                )}
                            </div>

                            <hr style={{ borderColor: "var(--border-color)", margin: "0.5rem 0" }} />

                            <button
                                onClick={() => {
                                    if (confirm(`Tem certeza que deseja APAGAR a equipa "${selectedTeam.name}"? Esta ação removerá a equipa e todos os seus jogadores permanentemente e não pode ser desfeita.`)) {
                                        deleteTeam(selectedTeam.id);
                                    }
                                }}
                                className="btn"
                                style={{
                                    width: "100%",
                                    background: "rgba(239, 68, 68, 0.1)",
                                    color: "#ef4444",
                                    border: "1px solid rgba(239, 68, 68, 0.2)"
                                }}
                            >
                                🗑️ Apagar Equipa Permanentemente
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
