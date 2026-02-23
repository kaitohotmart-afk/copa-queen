"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { TableExport } from "@/components/TableExport";

type Round = {
    id: string;
    name: string;
    created_at: string;
};

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

type RoundResult = {
    team_id: string;
    position: number;
    kills: number;
    booyah: boolean;
};

const POSITION_POINTS: Record<number, number> = {
    1: 20, 2: 17, 3: 15, 4: 13, 5: 11, 6: 9,
    7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1,
};

export default function AdminPontuacaoPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [rounds, setRounds] = useState<Round[]>([]);
    const [selectedRound, setSelectedRound] = useState<Round | null>(null);
    const [roundResults, setRoundResults] = useState<Record<string, RoundResult>>({});

    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form state for Modal
    const [formPosition, setFormPosition] = useState(0);
    const [formPlayerKills, setFormPlayerKills] = useState<Record<string, number>>({});

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        setIsLoading(true);
        await Promise.all([fetchTeams(), fetchRounds()]);
        setIsLoading(false);
    };

    const fetchTeams = async () => {
        try {
            const { data, error } = await supabase
                .from("teams")
                .select(`
                    id, name, tag, booyahs, team_kills, position_points, total_points,
                    players (id, name, kills)
                `)
                .order("total_points", { ascending: false });

            if (error) throw error;
            setTeams(data || []);
        } catch (error) {
            console.error("Erro ao buscar equipas:", error);
        }
    };

    const fetchRounds = async () => {
        try {
            const { data, error } = await supabase
                .from("rounds")
                .select("*")
                .order("created_at", { ascending: true });

            if (error) throw error;
            setRounds(data || []);
            if (data && data.length > 0) {
                handleSelectRound(data[data.length - 1]);
            }
        } catch (error) {
            console.error("Erro ao buscar quedas:", error);
        }
    };

    const handleSelectRound = async (round: Round) => {
        setSelectedRound(round);
        try {
            const { data: results, error } = await supabase
                .from("round_results")
                .select("*")
                .eq("round_id", round.id);

            if (error) throw error;

            const resultsMap: Record<string, RoundResult> = {};
            results?.forEach(r => {
                resultsMap[r.team_id] = {
                    team_id: r.team_id,
                    position: r.position,
                    kills: r.kills,
                    booyah: r.booyah
                };
            });
            setRoundResults(resultsMap);
        } catch (error) {
            console.error("Erro ao buscar resultados da queda:", error);
        }
    };

    const addRound = async () => {
        const name = prompt("Nome da Queda (ex: Queda 1, Final Round):");
        if (!name) return;

        try {
            const { data, error } = await supabase
                .from("rounds")
                .insert([{ name }])
                .select()
                .single();

            if (error) throw error;
            setRounds([...rounds, data]);
            handleSelectRound(data);
        } catch (error) {
            console.error("Erro ao criar queda:", error);
            alert("Erro ao criar queda.");
        }
    };

    const deleteRound = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta queda? Todos os pontos desta queda serão removidos do ranking geral.")) return;

        try {
            const { error } = await supabase.from("rounds").delete().eq("id", id);
            if (error) throw error;

            const remainingRounds = rounds.filter(r => r.id !== id);
            setRounds(remainingRounds);
            if (selectedRound?.id === id) {
                setSelectedRound(remainingRounds.length > 0 ? remainingRounds[remainingRounds.length - 1] : null);
            }
            fetchTeams(); // Totals will be updated by triggers
        } catch (error) {
            console.error("Erro ao excluir queda:", error);
        }
    };

    const openEdit = async (team: Team) => {
        if (!selectedRound) return;

        setEditingTeam(team);

        // Fetch existing result for this team in this round
        const existingResult = roundResults[team.id];

        if (existingResult) {
            setFormPosition(existingResult.position);
            // Fetch player kills for this specific round result
            const { data: playerResults } = await supabase
                .from("player_round_results")
                .select("player_id, kills")
                .in("player_id", team.players.map(p => p.id))
                // We need to filter by round_result_id, but we can just use the round_id + team_id path
                .eq("round_result_id", (
                    await supabase.from("round_results").select("id").eq("round_id", selectedRound.id).eq("team_id", team.id).maybeSingle()
                ).data?.id);

            const pkMap: Record<string, number> = {};
            team.players.forEach(p => pkMap[p.id] = 0);
            playerResults?.forEach(pr => pkMap[pr.player_id] = pr.kills);
            setFormPlayerKills(pkMap);
        } else {
            setFormPosition(0);
            const pkMap: Record<string, number> = {};
            team.players.forEach(p => pkMap[p.id] = 0);
            setFormPlayerKills(pkMap);
        }

        setShowModal(true);
    };

    const saveRoundResult = async () => {
        if (!selectedRound || !editingTeam) return;

        if (formPosition === 0) {
            alert("Selecione a posição.");
            return;
        }

        setIsSaving(true);

        try {
            const totalTeamKills = Object.values(formPlayerKills).reduce((a, b) => a + b, 0);
            const posPoints = POSITION_POINTS[formPosition] || 0;
            const isBooyah = formPosition === 1;

            // 1. Insert or Update round_results
            const { data: rr, error: rrError } = await supabase
                .from("round_results")
                .upsert({
                    round_id: selectedRound.id,
                    team_id: editingTeam.id,
                    position: formPosition,
                    position_points: posPoints,
                    kills: totalTeamKills,
                    booyah: isBooyah
                }, { onConflict: "round_id, team_id" })
                .select()
                .single();

            if (rrError) throw rrError;

            // 2. Insert or Update player_round_results
            for (const [playerId, kills] of Object.entries(formPlayerKills)) {
                const { error: prError } = await supabase
                    .from("player_round_results")
                    .upsert({
                        round_result_id: rr.id,
                        player_id: playerId,
                        kills: kills
                    }, { onConflict: "round_result_id, player_id" });

                if (prError) console.error("Erro ao salvar kills de jogador:", prError);
            }

            // Update local state
            setRoundResults({
                ...roundResults,
                [editingTeam.id]: {
                    team_id: editingTeam.id,
                    position: formPosition,
                    kills: totalTeamKills,
                    booyah: isBooyah
                }
            });

            // Trigger will update totals, so let's refresh teams list
            await fetchTeams();

            setShowModal(false);
            setEditingTeam(null);
        } catch (error: any) {
            console.error("Erro ao salvar resultado:", error);
            alert("Erro ao salvar resultado.");
        } finally {
            setIsSaving(false);
        }
    };

    const resetTeamsKeepMVP = async () => {
        if (!confirm("⚠️ ATENÇÃO: Isto irá zerar os pontos das equipas, apagando todas as quedas. No entanto, AS KILLS DOS JOGADORES (MVP) SERÃO MANTIDAS. Deseja continuar?")) return;
        if (!confirm("Tem absoluta certeza? As quedas não poderão ser recuperadas.")) return;

        setIsLoading(true);
        try {
            // 1. Fetch current players and their total kills
            const { data: players, error: fetchError } = await supabase.from("players").select("id, kills");
            if (fetchError) throw fetchError;

            // 2. Set baseline_kills to current kills for all players
            if (players) {
                for (const p of players) {
                    await supabase.from("players").update({ baseline_kills: p.kills }).eq("id", p.id);
                }
            }

            // 3. Delete rounds (this cascades to round_results and player_round_results)
            await supabase.from("player_round_results").delete().neq("id", "00000000-0000-0000-0000-000000000000");
            await supabase.from("round_results").delete().neq("id", "00000000-0000-0000-0000-000000000000");
            const { error: dropError } = await supabase.from("rounds").delete().neq("id", "00000000-0000-0000-0000-000000000000");

            if (dropError) throw dropError;

            setRounds([]);
            setSelectedRound(null);
            setRoundResults({});
            await fetchTeams();
            alert("Equipas zeradas com sucesso! MVP mantido.");
        } catch (error) {
            console.error("Erro ao resetar equipas:", error);
            alert("Erro ao resetar equipas.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetSystem = async () => {
        if (!confirm("⚠️ ATENÇÃO: Isto irá apagar todas as quedas, resultados e mortes de jogadores. A classificação voltará a zero. Deseja continuar?")) return;
        if (!confirm("Tem absoluta certeza? Esta ação não pode ser desfeita.")) return;

        setIsLoading(true);
        try {
            // Reset baseline for all players to 0 just to be sure
            const { data: players } = await supabase.from("players").select("id");
            if (players) {
                for (const p of players) {
                    await supabase.from("players").update({ baseline_kills: 0 }).eq("id", p.id);
                }
            }

            // Triggers will handle most of the summary reset, 
            // but we delete from child to parent for safety (though Supabase might handle it).
            await supabase.from("player_round_results").delete().neq("id", "00000000-0000-0000-0000-000000000000");
            await supabase.from("round_results").delete().neq("id", "00000000-0000-0000-0000-000000000000");
            const { error } = await supabase.from("rounds").delete().neq("id", "00000000-0000-0000-0000-000000000000");

            if (error) throw error;

            setRounds([]);
            setSelectedRound(null);
            setRoundResults({});
            await fetchTeams();
            alert("Sistema resetado com sucesso!");
        } catch (error) {
            console.error("Erro ao resetar sistema:", error);
            alert("Erro ao resetar sistema.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div style={{ padding: "2rem", textAlign: "center" }}>Carregando...</div>;
    }

    return (
        <div>
            <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Gestão de Quedas e Pontos</h1>
                    <p style={{ color: "var(--text-secondary)" }}>
                        Crie as quedas e registre o desempenho de cada equipa por rodada.
                    </p>
                </div>
                <button onClick={addRound} className="btn btn-primary" style={{ padding: "0.5rem 1rem" }}>
                    ➕ Nova Queda
                </button>
            </div>

            {/* Rounds Tabs */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
                {rounds.map((r) => (
                    <div key={r.id} style={{ display: "flex", alignItems: "center" }}>
                        <button
                            onClick={() => handleSelectRound(r)}
                            className={`btn ${selectedRound?.id === r.id ? "btn-primary" : "btn-secondary"}`}
                            style={{
                                padding: "0.5rem 1rem",
                                fontSize: "0.875rem",
                                borderTopRightRadius: 0,
                                borderBottomRightRadius: 0,
                                whiteSpace: "nowrap"
                            }}
                        >
                            {r.name}
                        </button>
                        <button
                            onClick={() => deleteRound(r.id)}
                            className={`btn ${selectedRound?.id === r.id ? "btn-primary" : "btn-secondary"}`}
                            style={{
                                padding: "0.5rem 0.5rem",
                                borderTopLeftRadius: 0,
                                borderBottomLeftRadius: 0,
                                borderLeft: "1px solid rgba(255,255,255,0.1)",
                                fontSize: "0.875rem"
                            }}
                        >
                            🗑️
                        </button>
                    </div>
                ))}
            </div>

            {selectedRound ? (
                <>
                    <div className="card" style={{ marginBottom: "2rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <h3 style={{ margin: 0 }}>Resultados: {selectedRound.name}</h3>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                Os pontos salvos aqui são somados automaticamente ao ranking geral.
                            </span>
                        </div>
                        <div style={{ overflowX: "auto" }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Equipa</th>
                                        <th style={{ textAlign: "center" }}>Posição</th>
                                        <th style={{ textAlign: "center" }}>Kills</th>
                                        <th style={{ textAlign: "center" }}>Status</th>
                                        <th>Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teams.map((team) => {
                                        const result = roundResults[team.id];
                                        return (
                                            <tr key={team.id}>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{team.name}</div>
                                                    <div style={{ fontSize: "0.75rem", color: "var(--purple)" }}>[{team.tag}]</div>
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    {result ? `${result.position}º` : "-"}
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    {result ? result.kills : "-"}
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    {result ? (
                                                        <span style={{ color: "#10b981", fontSize: "0.75rem" }}>✅ Salvo</span>
                                                    ) : (
                                                        <span style={{ color: "#ef4444", fontSize: "0.75rem" }}>⚠️ Pendente</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <button onClick={() => openEdit(team)} className="btn btn-secondary" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>
                                                        {result ? "Editar" : "Lançar"}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Ranking Geral (Atualizado)</h2>
                    <TableExport title="Classificação Geral">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "40px" }}>#</th>
                                    <th>Equipa</th>
                                    <th style={{ textAlign: "center" }}>🏆</th>
                                    <th style={{ textAlign: "center" }}>🔫</th>
                                    <th style={{ textAlign: "center" }}>⭐ Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teams.map((team, index) => (
                                    <tr key={team.id}>
                                        <td>{index + 1}</td>
                                        <td>{team.name} <span style={{ color: "var(--purple)", fontSize: "0.75rem" }}>[{team.tag}]</span></td>
                                        <td style={{ textAlign: "center" }}>{team.booyahs}</td>
                                        <td style={{ textAlign: "center" }}>{team.team_kills}</td>
                                        <td style={{ textAlign: "center", fontWeight: 700, color: "var(--purple)" }}>{team.total_points}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </TableExport>
                </>
            ) : (
                <div style={{ padding: "4rem", textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: "1rem", border: "1px dashed rgba(255,255,255,0.1)" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎮</div>
                    <h3>Nenhuma Queda Encontrada</h3>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>Crie sua primeira queda para começar a lançar os pontos.</p>
                    <button onClick={addRound} className="btn btn-primary">Criar Primeira Queda</button>
                </div>
            )}

            {/* Danger Zone */}
            <div style={{ marginTop: "4rem", padding: "2rem", background: "rgba(239, 68, 68, 0.05)", borderRadius: "1rem", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                <h3 style={{ color: "#ef4444", marginBottom: "0.5rem" }}>🧨 Zona de Perigo</h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                    Estas ações são permanentes e não podem ser desfeitas.
                </p>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <button onClick={resetTeamsKeepMVP} className="btn" style={{ background: "#f59e0b", color: "white", padding: "0.75rem 1.5rem", fontWeight: 600 }}>
                        Zerar Equipas (Manter MVP)
                    </button>
                    <button onClick={resetSystem} className="btn" style={{ background: "#ef4444", color: "white", padding: "0.75rem 1.5rem", fontWeight: 600 }}>
                        Resetar TUDO (Equipas + MVP)
                    </button>
                </div>
            </div>

            {/* Modal de Lançamento */}
            {showModal && editingTeam && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", zIndex: 1000 }} onClick={() => setShowModal(false)}>
                    <div className="card" style={{ maxWidth: "500px", width: "100%", maxHeight: "90vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <div>
                                <h2 style={{ marginBottom: "0.25rem" }}>
                                    {roundResults[editingTeam.id] ? "Editar Resultado" : "Lançar Resultado"}
                                </h2>
                                <span style={{ color: "var(--purple)" }}>{editingTeam.name} - {selectedRound?.name}</span>
                            </div>
                            <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.5rem", cursor: "pointer" }}>✕</button>
                        </div>

                        <div className="form-group">
                            <label className="label">Posição Final</label>
                            <select className="input" value={formPosition} onChange={(e) => setFormPosition(parseInt(e.target.value))}>
                                <option value={0}>Selecione...</option>
                                {Object.entries(POSITION_POINTS).map(([pos, pts]) => (
                                    <option key={pos} value={pos}>{pos}º Lugar ({pts} pts)</option>
                                ))}
                                <option value={13}>13º+ Lugar (0 pts)</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: "1.5rem" }}>
                            <label className="label" style={{ marginBottom: "0.75rem", display: "block" }}>🔫 Kills por Jogador</label>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {editingTeam.players.map(player => (
                                    <div key={player.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem", background: "var(--bg-darker)", borderRadius: "0.5rem" }}>
                                        <span style={{ flex: 1, fontWeight: 500 }}>{player.name}</span>
                                        <input
                                            type="number"
                                            className="input"
                                            style={{ width: "80px", textAlign: "center" }}
                                            value={formPlayerKills[player.id] || 0}
                                            onChange={(e) => setFormPlayerKills({ ...formPlayerKills, [player.id]: Math.max(0, parseInt(e.target.value) || 0) })}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                            <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                            <button onClick={saveRoundResult} className="btn btn-primary" style={{ flex: 1 }} disabled={isSaving}>
                                {isSaving ? "⏳ Salvando..." : "💾 Salvar Resultado"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
