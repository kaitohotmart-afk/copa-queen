"use client";

import { useState } from "react";

const defaultRegulations = `# Regulamento Oficial Copa Queen (Free Fire)

## 🔔 COMUNICADO OFICIAL – REGRAS E INSTRUÇÕES

A Copa Queen é um campeonato competitivo de Free Fire, e todas as equipas inscritas devem seguir rigorosamente as regras abaixo. O não cumprimento resultará em penalizações ou banimento.

## 📌 REGRAS GERAIS

- ❌ **Chamar jogadores aleatórios:** Penalização de -10 pontos.
- ❌ **Amizade ou favorecimento entre equipas:** Penalização de -20 pontos.
- ✅ **Somente jogadores inscritos podem jogar.** Jogador não inscrito → queda zerada.
- 🔁 **Troca de jogadores antes do início da copa:** Será cobrada uma taxa de 25 MZN por jogador.

## 🚫 USO DE PROGRAMAS ILEGAIS (HACK / XIT)

- 🚨 **Hackers:** banimento imediato.
- 🚨 **Jogador suspeito de uso de programas ilegais:**
  - Será retirado imediatamente da competição.
  - A equipa terá 3 minutos para substituição.
- 🚨 **Uso de XIT confirmado:** Banimento de toda a line da Copa Queen 💀

## 🚷 PROIBIÇÕES (Penalização: -35 pontos)

- ❌ Proibido quebrar raio
- ❌ Proibido marcar inimigos na loja

## 🚩 MAPAS

- ⚠️ Todos os mapas devem ser baixados antecipadamente.
- A administração não irá esperar downloads no momento da partida.
- Equipa que ficar de fora por esse motivo assume total responsabilidade.

## 🎯 SISTEMA DE PONTUAÇÃO

### 🔫 KILLS
- 1 kill = 1 ponto

### 🏆 POSIÇÃO FINAL
- 1º lugar – 20 pts
- 2º lugar – 17 pts
- 3º lugar – 15 pts
- 4º lugar – 13 pts
- 5º lugar – 11 pts
- 6º lugar – 9 pts
- 7º lugar – 6 pts
- 8º lugar – 5 pts
- 9º lugar – 4 pts
- 10º lugar – 3 pts
- 11º lugar – 2 pts
- 12º lugar – 1 pt

### ⚖️ CRITÉRIO DE DESEMPATE
1. Maior número de booyahs
2. Maior número de kills

## 🎮 ORGANIZAÇÃO DAS SALAS

- Cada line terá um slot definido pela administração.
- Equipa que estiver em slot errado poderá ser retirada da sala.

## 📌 Considerações Finais

O regulamento existe para garantir organização, justiça e competitividade.
Qualquer situação não prevista será resolvida pela administração da Copa Queen.

---

*Última atualização: Janeiro 2026*
*© Copa Queen - Season 2*
`;

export default function AdminRegulamentoPage() {
    const [content, setContent] = useState(defaultRegulations);
    const [isSaving, setIsSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    const handleSave = async () => {
        setIsSaving(true);

        // TODO: Save to Supabase
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setLastSaved(new Date().toLocaleTimeString("pt-BR"));
        setIsSaving(false);
    };

    return (
        <div>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Editar Regulamento</h1>
                <p style={{ color: "var(--text-secondary)" }}>
                    Atualize as regras oficiais do campeonato
                </p>
            </div>

            {/* Actions Bar */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                    flexWrap: "wrap",
                    gap: "1rem",
                }}
            >
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                        onClick={() => setShowPreview(false)}
                        className={`btn ${!showPreview ? "btn-primary" : "btn-secondary"}`}
                        style={{ padding: "0.5rem 1rem" }}
                    >
                        ✏️ Editar
                    </button>
                    <button
                        onClick={() => setShowPreview(true)}
                        className={`btn ${showPreview ? "btn-primary" : "btn-secondary"}`}
                        style={{ padding: "0.5rem 1rem" }}
                    >
                        👁️ Pré-visualizar
                    </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    {lastSaved && (
                        <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                            ✅ Salvo às {lastSaved}
                        </span>
                    )}
                    <button onClick={handleSave} className="btn btn-primary" disabled={isSaving}>
                        {isSaving ? "Salvando..." : "💾 Salvar Alterações"}
                    </button>
                </div>
            </div>

            {/* Editor / Preview */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                {showPreview ? (
                    <div
                        className="regulations-content"
                        style={{ padding: "2rem" }}
                        dangerouslySetInnerHTML={{
                            __html: content
                                .replace(/^# (.+)$/gm, '<h1>$1</h1>')
                                .replace(/^## (.+)$/gm, '<h2>$1</h2>')
                                .replace(/^### (.+)$/gm, '<h3>$1</h3>')
                                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                                .replace(/^- (.+)$/gm, '<li>$1</li>')
                                .replace(/(<li>[\s\S]*<\/li>)/, '<ul>$1</ul>')
                                .replace(/\n\n/g, '<br/><br/>'),
                        }}
                    />
                ) : (
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={{
                            width: "100%",
                            minHeight: "600px",
                            padding: "1.5rem",
                            background: "var(--bg-darker)",
                            border: "none",
                            color: "var(--text-primary)",
                            fontFamily: "monospace",
                            fontSize: "0.875rem",
                            lineHeight: 1.6,
                            resize: "vertical",
                        }}
                        placeholder="Escreva o regulamento em Markdown..."
                    />
                )}
            </div>

            {/* Help */}
            <div
                style={{
                    marginTop: "1rem",
                    padding: "1rem",
                    background: "var(--bg-card)",
                    borderRadius: "0.75rem",
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                }}
            >
                <strong>💡 Dica:</strong> Use Markdown para formatar o texto:
                <code style={{ marginLeft: "0.5rem", background: "var(--bg-darker)", padding: "0.125rem 0.375rem", borderRadius: "4px" }}>
                    # Título, ## Subtítulo, **negrito**, - lista
                </code>
            </div>
        </div>
    );
}
