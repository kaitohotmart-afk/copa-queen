"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { TableExport } from "@/components/TableExport";

type Player = {
    id: string;
    name: string;
    kills: number;
    team: {
        name: string;
        tag: string;
    };
};

export default function AdminMVPPage() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
    const [formKills, setFormKills] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
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
                .order("kills", { ascending: false });

            if (error) throw error;

            const formattedPlayers = data?.map(p => ({
                id: p.id,
                name: p.name,
                kills: p.kills,
                team: Array.isArray(p.team) ? p.team[0] : p.team
            })) || [];

            setPlayers(formattedPlayers);
        } catch (error) {
            console.error("Erro ao buscar jogadores:", error);
            alert("Erro ao carregar dados.");
        } finally {
            setIsLoading(false);
        }
    };

    const openEdit = (player: Player) => {
        setEditingPlayer(player);
        setFormKills(player.kills);
        setShowModal(true);
    };

    const saveChanges = async () => {
        if (!editingPlayer) return;

        try {
            const { error } = await supabase
                .from("players")
                .update({ kills: formKills })
                .eq("id", editingPlayer.id);

            if (error) throw error;

            setPlayers(
                players.map((p) =>
                    p.id === editingPlayer.id ? { ...p, kills: formKills } : p
                )
            );

            setShowModal(false);
            setEditingPlayer(null);
        } catch (error) {
            console.error("Erro ao salvar kills:", error);
            alert("Erro ao salvar alterações.");
        }
    };

    const filteredPlayers = players.filter(
        (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.team.tag.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedPlayers = [...filteredPlayers].sort((a, b) => b.kills - a.kills);
    const topPlayers = sortedPlayers.filter(p => p.kills > 0).slice(0, 20);

    // Calculate team totals
    const teamTotals = players.reduce((acc, player) => {
        const key = player.team.tag;
        if (!acc[key]) {
            acc[key] = { team: player.team.name, tag: player.team.tag, totalKills: 0 };
        }
        acc[key].totalKills += player.kills;
        return acc;
    }, {} as Record<string, { team: string; tag: string; totalKills: number }>);

    if (isLoading) {
        return <div style={{ padding: "2rem", textAlign: "center" }}>Carregando...</div>;
    }

    return (
        <div>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Gestão de MVP</h1>
                <p style={{ color: "var(--text-secondary)" }}>
                    Edite as kills individuais dos jogadores
                </p>
            </div>

            {/* Team Totals */}
            <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ marginBottom: "1rem", fontSize: "1rem" }}>📊 Kills por Equipa</h3>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    {Object.values(teamTotals)
                        .sort((a, b) => b.totalKills - a.totalKills)
                        .map((team) => (
                            <div
                                key={team.tag}
                                className="card"
                                style={{ padding: "1rem", minWidth: "150px", textAlign: "center" }}
                            >
                                <div style={{ color: "var(--purple)", fontSize: "0.875rem" }}>[{team.tag}]</div>
                                <div style={{ fontWeight: 700, fontSize: "1.5rem" }}>{team.totalKills}</div>
                                <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>kills</div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Exportable MVP Table */}
            <TableExport title="Ranking MVP">
                <table className="data-table" style={{ margin: 0 }}>
                    <thead>
                        <tr>
                            <th style={{ width: "60px" }}>#</th>
                            <th>Jogador</th>
                            <th>Equipa</th>
                            <th style={{ textAlign: "center" }}>🔫 Kills</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topPlayers.map((player, index) => (
                            <tr key={player.id}>
                                <td>
                                    <div
                                        className={`rank ${index === 0 ? "rank-1" : index === 1 ? "rank-2" : index === 2 ? "rank-3" : ""}`}
                                    >
                                        {index === 0 ? "👑" : index + 1}
                                    </div>
                                </td>
                                <td style={{ fontWeight: 600 }}>{player.name}</td>
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
                                            color: index < 3 ? "var(--cyan)" : "var(--text-primary)",
                                        }}
                                    >
                                        {player.kills}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {topPlayers.length === 0 && (
                            <tr>
                                <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                                    Nenhum jogador pontuou ainda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </TableExport>

            {/* Search & Edit Section */}
            <div className="card" style={{ marginTop: "1rem" }}>
                <h3 style={{ marginBottom: "1rem" }}>⚙️ Editar Kills</h3>

                {/* Search */}
                <div style={{ marginBottom: "1rem" }}>
                    <input
                        type="text"
                        className="input"
                        placeholder="🔍 Pesquisar jogador ou equipa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ maxWidth: "400px" }}
                    />
                </div>

                {/* Players Table */}
                <div style={{ overflowX: "auto" }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Jogador</th>
                                <th>Equipa</th>
                                <th style={{ textAlign: "center" }}>🔫 Kills</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedPlayers.slice(0, 50).map((player) => (
                                <tr key={player.id}>
                                    <td style={{ fontWeight: 600 }}>{player.name}</td>
                                    <td>
                                        <span style={{ color: "var(--text-secondary)" }}>{player.team.name}</span>
                                        <span style={{ marginLeft: "0.5rem", color: "var(--purple)", fontSize: "0.875rem" }}>
                                            [{player.team.tag}]
                                        </span>
                                    </td>
                                    <td style={{ textAlign: "center", fontWeight: 700 }}>{player.kills}</td>
                                    <td>
                                        <button
                                            onClick={() => openEdit(player)}
                                            className="btn btn-secondary"
                                            style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem" }}
                                        >
                                            ✏️ Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {showModal && editingPlayer && (
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
                        style={{ maxWidth: "400px", width: "100%" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <div>
                                <h2 style={{ marginBottom: "0.25rem" }}>Editar Kills</h2>
                                <span style={{ color: "var(--cyan)" }}>{editingPlayer.name}</span>
                                <span style={{ color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                                    ({editingPlayer.team.name})
                                </span>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.5rem", cursor: "pointer" }}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="form-group">
                            <label className="label">🔫 Número de Kills</label>
                            <input
                                type="number"
                                className="input"
                                value={formKills}
                                onChange={(e) => setFormKills(Math.max(0, parseInt(e.target.value) || 0))}
                                min={0}
                                style={{ fontSize: "1.5rem", textAlign: "center" }}
                            />
                        </div>

                        <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
                            <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                                Cancelar
                            </button>
                            <button onClick={saveChanges} className="btn btn-primary" style={{ flex: 1 }}>
                                💾 Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
