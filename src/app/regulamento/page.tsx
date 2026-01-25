export default function RegulamentoPage() {
    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Regulamento</h1>
                <p className="page-subtitle">
                    Regras oficiais da Copa Queen - Free Fire
                </p>
            </div>

            <div className="container" style={{ paddingBottom: "4rem" }}>
                <div className="card regulations-content">
                    <div
                        style={{
                            textAlign: "center",
                            padding: "1.5rem",
                            marginBottom: "2rem",
                            background: "rgba(139, 92, 246, 0.1)",
                            borderRadius: "0.75rem",
                            border: "1px solid rgba(139, 92, 246, 0.3)"
                        }}
                    >
                        <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🔔</div>
                        <strong>COMUNICADO OFICIAL – REGRAS E INSTRUÇÕES</strong>
                        <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                            Todas as equipas devem seguir rigorosamente as regras abaixo.
                            O não cumprimento resultará em penalizações ou banimento.
                        </p>
                    </div>

                    <h2>📌 REGRAS GERAIS</h2>

                    <ul>
                        <li><strong style={{ color: "var(--status-error)" }}>❌ Chamar jogadores aleatórios:</strong> Penalização de <strong>-10 pontos</strong>.</li>
                        <li><strong style={{ color: "var(--status-error)" }}>❌ Amizade ou favorecimento entre equipas:</strong> Penalização de <strong>-20 pontos</strong>.</li>
                        <li><strong style={{ color: "var(--status-confirmed)" }}>✅ Somente jogadores inscritos podem jogar.</strong> Jogador não inscrito → queda zerada.</li>
                        <li><strong>🔁 Troca de jogadores antes do início da copa:</strong> Será cobrada uma taxa de <strong>25 MZN</strong> por jogador.</li>
                    </ul>

                    <h2>🚫 USO DE PROGRAMAS ILEGAIS (HACK / XIT)</h2>

                    <ul>
                        <li><strong>🚨 Hackers:</strong> banimento imediato.</li>
                        <li><strong>🚨 Jogador suspeito de uso de programas ilegais:</strong>
                            <ul>
                                <li>Será retirado imediatamente da competição.</li>
                                <li>A equipa terá <strong>3 minutos</strong> para substituição.</li>
                            </ul>
                        </li>
                        <li><strong>🚨 Uso de XIT confirmado:</strong> Banimento de <strong>toda a line</strong> da Copa Queen 💀</li>
                    </ul>

                    <h2>🚷 PROIBIÇÕES</h2>

                    <div
                        style={{
                            background: "rgba(239, 68, 68, 0.1)",
                            padding: "1rem",
                            borderRadius: "0.75rem",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            marginBottom: "1rem"
                        }}
                    >
                        <strong style={{ color: "var(--status-error)" }}>Penalização: -35 pontos</strong>
                        <ul style={{ marginTop: "0.5rem", marginBottom: 0 }}>
                            <li>❌ Proibido quebrar raio</li>
                            <li>❌ Proibido marcar inimigos na loja</li>
                        </ul>
                    </div>

                    <h2>🚩 MAPAS</h2>

                    <ul>
                        <li>⚠️ <strong>Todos os mapas devem ser baixados antecipadamente.</strong></li>
                        <li>A administração não irá esperar downloads no momento da partida.</li>
                        <li>Equipa que ficar de fora por esse motivo assume total responsabilidade.</li>
                    </ul>

                    <h2>🎯 SISTEMA DE PONTUAÇÃO</h2>

                    <h3>🔫 KILLS</h3>
                    <p><strong>1 kill = 1 ponto</strong></p>

                    <h3>🏆 POSIÇÃO FINAL</h3>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                            gap: "0.5rem",
                            marginTop: "1rem"
                        }}
                    >
                        {[
                            { pos: "1º lugar", pts: "20 pts" },
                            { pos: "2º lugar", pts: "17 pts" },
                            { pos: "3º lugar", pts: "15 pts" },
                            { pos: "4º lugar", pts: "13 pts" },
                            { pos: "5º lugar", pts: "11 pts" },
                            { pos: "6º lugar", pts: "9 pts" },
                            { pos: "7º lugar", pts: "6 pts" },
                            { pos: "8º lugar", pts: "5 pts" },
                            { pos: "9º lugar", pts: "4 pts" },
                            { pos: "10º lugar", pts: "3 pts" },
                            { pos: "11º lugar", pts: "2 pts" },
                            { pos: "12º lugar", pts: "1 pt" },
                        ].map((item) => (
                            <div
                                key={item.pos}
                                style={{
                                    background: "var(--bg-darker)",
                                    padding: "0.75rem",
                                    borderRadius: "0.5rem",
                                    textAlign: "center"
                                }}
                            >
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.pos}</div>
                                <div style={{ fontWeight: 700, color: "var(--cyan)" }}>{item.pts}</div>
                            </div>
                        ))}
                    </div>

                    <h3>⚖️ CRITÉRIO DE DESEMPATE</h3>
                    <ol>
                        <li><strong>1️⃣ Maior número de Booyah</strong></li>
                        <li><strong>2️⃣ Maior número de kills</strong></li>
                    </ol>

                    <h2>🎮 ORGANIZAÇÃO DAS SALAS</h2>

                    <ul>
                        <li>Cada line terá um slot definido pela administração.</li>
                        <li>Equipa que estiver em slot errado poderá ser retirada da sala.</li>
                    </ul>

                    <h2>📌 Considerações Finais</h2>

                    <p>
                        O regulamento existe para garantir <strong>organização</strong>, <strong>justiça</strong> e <strong>competitividade</strong>.
                        Qualquer situação não prevista será resolvida pela administração da Copa Queen.
                    </p>

                    <div
                        style={{
                            marginTop: "3rem",
                            textAlign: "center",
                            padding: "1.5rem",
                            background: "var(--bg-darker)",
                            borderRadius: "0.75rem"
                        }}
                    >
                        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                            Última atualização: Janeiro 2026
                        </p>
                        <p style={{ marginTop: "0.5rem", fontWeight: 600 }}>
                            © Copa Queen - Season 2
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
