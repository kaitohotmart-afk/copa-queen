"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { TableExport } from "@/components/TableExport";

type Player = {
    id: string;
    name: string;
    kills: number;
};

type Team = {
    id: string;
    name: string;
    tag: string;
    booyahs: number;
    team_kills: number;
    position_points: number;
    total_points: number;
    players: Player[];
};

const POSITION_POINTS: Record<number, number> = {
    1: 20, 2: 17, 3: 15, 4: 13, 5: 11, 6: 9,
    7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1,
};

export default function AdminPontuacaoPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [formBooyahs, setFormBooyahs] = useState(0);
    const [formPosition, setFormPosition] = useState(0);
    const [formPlayerKills, setFormPlayerKills] = useState<Record<string, number>>({});

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const { data, error } = await supabase
                .from("teams")
                .select(`
                    id, name, tag, booyahs, team_kills, position_points, total_points,
                    players (id, name, kills)
                `)
                .order("booyahs", { ascending: false })
                .order("team_kills", { ascending: false });

            if (error) throw error;
            setTeams(data || []);
        } catch (error) {
            console.error("Erro ao buscar equipas:", error);
            alert("Erro ao carregar dados.");
        } finally {
            setIsLoading(false);
        }
    };

    const openEdit = (team: Team) => {
        setEditingTeam(team);
        setFormBooyahs(team.booyahs);
        // Reverse lookup position from points
        const position = Object.entries(POSITION_POINTS).find(
            ([, pts]) => pts === team.position_points
        )?.[0] || "0";
        setFormPosition(parseInt(position));
        // Initialize player kills
        const playerKills: Record<string, number> = {};
        team.players?.forEach((p) => {
            playerKills[p.id] = p.kills;
        });
        setFormPlayerKills(playerKills);
        setShowModal(true);
    };

    const saveChanges = async () => {
        if (!editingTeam) return;

        // Basic validation
        if (formPosition === 0) {
            alert("Por favor, selecione uma posição final.");
            return;
        }

        setIsSaving(true);

        try {
            // Calculate totals
            const totalKills = Object.values(formPlayerKills).reduce((acc, k) => acc + k, 0);
            const positionPoints = POSITION_POINTS[formPosition] || 0;
            const totalPoints = totalKills + positionPoints;

            // Update team
            const { error: teamError } = await supabase
                .from("teams")
                .update({
                    booyahs: formBooyahs,
                    team_kills: totalKills,
                    position_points: positionPoints,
                })
                .eq("id", editingTeam.id);

            if (teamError) {
                console.error("Erro Supabase (tabela teams):", teamError);
                throw new Error(`Erro ao atualizar equipa: ${teamError.message}`);
            }

            // Update each player's kills
            for (const [playerId, kills] of Object.entries(formPlayerKills)) {
                const { error: playerError } = await supabase
                    .from("players")
                    .update({ kills })
                    .eq("id", playerId);

                if (playerError) {
                    console.error(`Erro Supabase (jogador ${playerId}):`, playerError);
                    throw new Error(`Erro ao atualizar jogador: ${playerError.message}`);
                }
            }

            // Update local state
            setTeams(
                teams.map((team) =>
                    team.id === editingTeam.id
                        ? {
                            ...team,
                            booyahs: formBooyahs,
                            team_kills: totalKills,
                            position_points: positionPoints,
                            total_points: totalPoints,
                            players: team.players?.map((p) => ({
                                ...p,
                                kills: formPlayerKills[p.id] ?? p.kills,
                            })),
                        }
                        : team
                )
            );

            setShowModal(false);
            setEditingTeam(null);
            alert("Alterações salvas com sucesso!");
        } catch (error: any) {
            console.error("Erro ao salvar alterações:", error);
            alert(error.message || "Erro inesperado ao salvar alterações.");
        } finally {
            setIsSaving(false);
        }
    };

    // Sort by BOOYAH first, then kills
    const sortedTeams = [...teams].sort((a, b) => {
        if (b.booyahs !== a.booyahs) return b.booyahs - a.booyahs;
        return b.team_kills - a.team_kills;
    });

    const currentTotalKills = Object.values(formPlayerKills).reduce((a, b) => a + b, 0);
    const currentPositionPoints = POSITION_POINTS[formPosition] || 0;

    if (isLoading) {
        return <div style={{ padding: "2rem", textAlign: "center" }}>Carregando...</div>;
    }

    return (
        <div>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Gestão de Pontuação</h1>
                <p style={{ color: "var(--text-secondary)" }}>
                    Edite kills por jogador, BOOYAH e posição das equipas
                </p>
            </div>

            {/* Info Box */}
            <div
                style={{
                    marginBottom: "1.5rem",
                    padding: "1rem",
                    background: "rgba(139, 92, 246, 0.1)",
                    borderRadius: "0.75rem",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    fontSize: "0.875rem",
                }}
            >
                <strong style={{ color: "var(--purple)" }}>ℹ️ Sistema de Pontuação:</strong>
                <span style={{ marginLeft: "0.5rem", color: "var(--text-secondary)" }}>
                    Total = Kills + Pontos de Posição | Ordenação: 1º BOOYAH, 2º Kills
                </span>
            </div>

            {/* Exportable Table */}
            <TableExport title="Classificação">
                <table className="data-table" style={{ margin: 0 }}>
                    <thead>
                        <tr>
                            <th style={{ width: "60px" }}>#</th>
                            <th>Equipa</th>
                            <th style={{ textAlign: "center" }}>🏆 BOOYAH</th>
                            <th style={{ textAlign: "center" }}>🔫 Kills</th>
                            <th style={{ textAlign: "center" }}>📍 Pos.</th>
                            <th style={{ textAlign: "center" }}>⭐ Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTeams.map((team, index) => (
                            <tr key={team.id}>
                                <td>
                                    <div
                                        className={`rank ${index === 0 ? "rank-1" : index === 1 ? "rank-2" : index === 2 ? "rank-3" : ""}`}
                                    >
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
                                <td style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                                    {team.position_points}
                                </td>
                                <td style={{ textAlign: "center" }}>
                                    <span
                                        style={{
                                            fontWeight: 700,
                                            fontSize: "1.25rem",
                                            background: "var(--gradient-primary)",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                        }}
                                    >
                                        {team.total_points}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </TableExport>

            {/* Edit Buttons (outside export) */}
            <div className="card" style={{ marginTop: "1rem", padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "1rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <strong>⚙️ Ações de Edição</strong>
                </div>
                <div style={{ overflowX: "auto" }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Equipa</th>
                                <th style={{ textAlign: "center" }}>Jogadores</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTeams.map((team) => (
                                <tr key={team.id}>
                                    <td>
                                        <span style={{ fontWeight: 600 }}>{team.name}</span>
                                        <span style={{ color: "var(--purple)", marginLeft: "0.5rem" }}>[{team.tag}]</span>
                                    </td>
                                    <td style={{ textAlign: "center" }}>{team.players?.length || 0}</td>
                                    <td>
                                        <button
                                            onClick={() => openEdit(team)}
                                            className="btn btn-secondary"
                                            style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem" }}
                                        >
                                            ✏️ Editar Pontuação
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {showModal && editingTeam && (
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
                                alignItems: "center",
                                marginBottom: "1.5rem",
                            }}
                        >
                            <div>
                                <h2 style={{ marginBottom: "0.25rem" }}>Editar Pontuação</h2>
                                <span style={{ color: "var(--purple)" }}>
                                    {editingTeam.name} [{editingTeam.tag}]
                                </span>
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

                        {/* BOOYAH and Position */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                            <div className="form-group">
                                <label className="label">🏆 BOOYAH</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={formBooyahs}
                                    onChange={(e) => setFormBooyahs(Math.max(0, parseInt(e.target.value) || 0))}
                                    min={0}
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">📍 Posição Final</label>
                                <select
                                    className="input"
                                    value={formPosition}
                                    onChange={(e) => setFormPosition(parseInt(e.target.value))}
                                    style={{ cursor: "pointer" }}
                                >
                                    <option value={0}>-- Selecionar --</option>
                                    {Object.entries(POSITION_POINTS).map(([pos, pts]) => (
                                        <option key={pos} value={pos}>
                                            {pos}º lugar ({pts} pts)
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Player Kills */}
                        <div style={{ marginBottom: "1.5rem" }}>
                            <label className="label" style={{ marginBottom: "0.75rem", display: "block" }}>
                                🔫 Kills por Jogador
                            </label>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {editingTeam.players?.map((player) => (
                                    <div
                                        key={player.id}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "1rem",
                                            padding: "0.75rem",
                                            background: "var(--bg-darker)",
                                            borderRadius: "0.5rem",
                                        }}
                                    >
                                        <span style={{ flex: 1, fontWeight: 500 }}>{player.name}</span>
                                        <input
                                            type="number"
                                            className="input"
                                            value={formPlayerKills[player.id] ?? 0}
                                            onChange={(e) =>
                                                setFormPlayerKills({
                                                    ...formPlayerKills,
                                                    [player.id]: Math.max(0, parseInt(e.target.value) || 0),
                                                })
                                            }
                                            min={0}
                                            style={{ width: "80px", textAlign: "center" }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals Preview */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 1fr",
                                gap: "0.5rem",
                                padding: "1rem",
                                background: "var(--bg-darker)",
                                borderRadius: "0.75rem",
                                textAlign: "center",
                            }}
                        >
                            <div>
                                <div style={{ color: "var(--text-muted)", fontSize: "0.625rem", marginBottom: "0.25rem" }}>
                                    KILLS
                                </div>
                                <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{currentTotalKills}</div>
                            </div>
                            <div>
                                <div style={{ color: "var(--text-muted)", fontSize: "0.625rem", marginBottom: "0.25rem" }}>
                                    POSIÇÃO
                                </div>
                                <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{currentPositionPoints}</div>
                            </div>
                            <div>
                                <div style={{ color: "var(--text-muted)", fontSize: "0.625rem", marginBottom: "0.25rem" }}>
                                    TOTAL
                                </div>
                                <div
                                    style={{
                                        fontSize: "1.25rem",
                                        fontWeight: 700,
                                        background: "var(--gradient-primary)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                    }}
                                >
                                    {currentTotalKills + currentPositionPoints}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
                            <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                                Cancelar
                            </button>
                            <button onClick={saveChanges} className="btn btn-primary" style={{ flex: 1 }} disabled={isSaving}>
                                {isSaving ? "⏳ Salvando..." : "💾 Salvar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
