"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function InscricaoPage() {
    const [teamName, setTeamName] = useState("");
    const [teamTag, setTeamTag] = useState("");
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

        // Validate
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
                        status: "pending",
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

            const playersList = filledPlayers.map((p, i) => `${i + 1}. ${p}`).join("\n");

            const message = `🏆 *INSCRIÇÃO COPA QUEEN - SEASON 2*

📋 *Dados da Equipa:*
▸ Nome: ${teamName}
▸ Tag: ${teamTag}

👥 *Jogadores:*
${playersList}

💰 *Aguardando informações de pagamento*

_Esta é uma inscrição automática via site Copa Queen_`;

            // Redirect to WhatsApp - Official number
            const phoneNumber = "258860299071";
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

            window.open(whatsappUrl, "_blank");

            // Show success message
            alert("Inscrição enviada! Complete o pagamento via WhatsApp para confirmar.");

            // Reset form
            setTeamName("");
            setTeamTag("");
            setPlayers(["", "", "", ""]);

        } catch (error) {
            console.error("Erro ao salvar inscrição:", error);
            alert("Erro ao processar inscrição. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Inscrever Equipa</h1>
                <p className="page-subtitle">
                    Preencha os dados da sua line para participar da Copa Queen
                </p>
            </div>

            <div className="container" style={{ maxWidth: "600px", paddingBottom: "4rem" }}>
                <form onSubmit={handleSubmit} className="card" style={{ padding: "2rem" }}>
                    {/* Team Info */}
                    <div className="form-grid">
                        <h3 style={{ marginBottom: "1rem", color: "var(--purple)" }}>
                            📋 Informações da Equipa
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

                    {/* Info Box */}
                    <div
                        style={{
                            marginTop: "1.5rem",
                            padding: "1rem",
                            background: "rgba(139, 92, 246, 0.1)",
                            borderRadius: "0.75rem",
                            border: "1px solid rgba(139, 92, 246, 0.3)",
                        }}
                    >
                        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                            ℹ️ Ao confirmar, serás redirecionado para o WhatsApp com os dados da
                            inscrição. A equipa ficará com status{" "}
                            <strong style={{ color: "var(--status-pending)" }}>Pendente</strong> até a
                            confirmação do pagamento.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%", marginTop: "1.5rem", padding: "1rem" }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Processando..." : "✅ Confirmar Inscrição"}
                    </button>
                </form>
            </div>
        </>
    );
}
