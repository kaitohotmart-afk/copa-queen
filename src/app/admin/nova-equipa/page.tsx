"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminNewTeamPage() {
    const router = useRouter();
    const [teamName, setTeamName] = useState("");
    const [teamTag, setTeamTag] = useState("");
    const [status, setStatus] = useState("confirmed");
    const [players, setPlayers] = useState<string[]>(["", "", "", ""]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addPlayer = () => {
        if (players.length < 6) {
            setPlayers([...players, ""]);
        }
    };

    const removePlayer = (index: number) => {
        if (players.length > 4) {
            setPlayers(players.filter((_, i) => i !== index));
        }
    };

    const updatePlayer = (index: number, value: string) => {
        const newPlayers = [...players];
        newPlayers[index] = value;
        setPlayers(newPlayers);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!teamName.trim() || !teamTag.trim()) {
            alert("Preencha o nome e tag da equipa!");
            return;
        }

        const filledPlayers = players.filter((p) => p.trim());
        if (filledPlayers.length < 4) {
            alert("A equipa precisa de pelo menos 4 jogadores!");
            return;
        }

        setIsSubmitting(true);

        try {
            // Save to Supabase
            const { data: teamData, error: teamError } = await supabase
                .from("teams")
                .insert([
                    {
                        name: teamName,
                        tag: teamTag,
                        status: status,
                    },
                ])
                .select()
                .single();

            if (teamError) throw teamError;

            if (teamData) {
                const playersToInsert = filledPlayers.map((playerName, index) => ({
                    team_id: teamData.id,
                    name: playerName,
                    is_reserve: index >= 4,
                }));

                const { error: playersError } = await supabase
                    .from("players")
                    .insert(playersToInsert);

                if (playersError) throw playersError;
            }

            alert("Equipa inscrita com sucesso!");
            router.push("/admin/equipas");

        } catch (error) {
            console.error("Erro ao salvar inscrição:", error);
            alert("Erro ao processar inscrição. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                <Link href="/admin/dashboard" className="btn btn-secondary" style={{ padding: "0.5rem 1rem" }}>
                    ← Voltar
                </Link>
                <div>
                    <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>Nova Equipa</h1>
                    <p style={{ color: "var(--text-secondary)" }}>Inscrição manual de equipa</p>
                </div>
            </div>

            <div className="card" style={{ maxWidth: "800px" }}>
                <form onSubmit={handleSubmit}>
                    {/* Team Info */}
                    <div className="form-grid">
                        <h3 style={{ marginBottom: "1rem", color: "var(--purple)" }}>
                            📋 Dados da Equipa
                        </h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="label">Nome da Equipa *</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Ex: Queen Warriors"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">Tag da Equipa *</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Ex: QW"
                                    value={teamTag}
                                    onChange={(e) => setTeamTag(e.target.value.toUpperCase())}
                                    maxLength={5}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">Status Inicial</label>
                                <select
                                    className="input"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    style={{ appearance: "none" }} // Simple styling for select
                                >
                                    <option value="confirmed">🟢 Confirmada</option>
                                    <option value="pending">🟡 Pendente</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Players */}
                    <div className="form-grid" style={{ marginTop: "2rem" }}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "1rem",
                            }}
                        >
                            <h3 style={{ color: "var(--purple)" }}>👥 Jogadores ({players.length}/6)</h3>
                            {players.length < 6 && (
                                <button
                                    type="button"
                                    onClick={addPlayer}
                                    className="btn btn-secondary"
                                    style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                                >
                                    + Adicionar Reserva
                                </button>
                            )}
                        </div>

                        {players.map((player, index) => (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.75rem",
                                    marginBottom: "0.75rem",
                                }}
                            >
                                <div
                                    style={{
                                        minWidth: "80px",
                                        fontSize: "0.75rem",
                                        color: "var(--text-secondary)",
                                        fontWeight: 600,
                                    }}
                                >
                                    {index < 4 ? `Titular ${index + 1}` : `Reserva ${index - 3}`}
                                    {index < 4 && " *"}
                                </div>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Nome do jogador"
                                    value={player}
                                    onChange={(e) => updatePlayer(index, e.target.value)}
                                    required={index < 4}
                                    style={{ flex: 1 }}
                                />
                                {index >= 4 && (
                                    <button
                                        type="button"
                                        onClick={() => removePlayer(index)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            color: "var(--status-error)",
                                            cursor: "pointer",
                                            fontSize: "1.25rem",
                                            padding: "0.5rem",
                                        }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Submit Button */}
                    <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                            style={{ minWidth: "200px" }}
                        >
                            {isSubmitting ? "Salvando..." : "💾 Salvar Equipa"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
