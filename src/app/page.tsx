"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalPlayers: 0,
    totalKills: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get team count
      const { count: teamCount } = await supabase
        .from("teams")
        .select("*", { count: "exact", head: true });

      // Get player count
      const { count: playerCount } = await supabase
        .from("players")
        .select("*", { count: "exact", head: true });

      // Get total kills
      const { data: killsData } = await supabase
        .from("players")
        .select("kills");

      const totalKills = killsData?.reduce((acc, p) => acc + (p.kills || 0), 0) || 0;

      setStats({
        totalTeams: teamCount || 0,
        totalPlayers: playerCount || 0,
        totalKills,
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <span className="hero-badge">
          🏆 Season 2
        </span>

        <h1 className="hero-title">
          COPA QUEEN
          <span style={{ display: "block", fontSize: "0.5em", marginTop: "0.5rem", color: "var(--cyan)" }}>
            BATTLE ROYALE
          </span>
        </h1>

        <p className="hero-subtitle">
          O maior campeonato de Free Fire.
          <br />
          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Premiação: 6.500 MT | Inscrição: 80 MT
          </span>
        </p>

        <div className="hero-buttons">
          <Link href="/inscricao" className="btn btn-primary animate-glow">
            🔥 Inscrever Equipa
          </Link>
          <Link href="/regulamento" className="btn btn-secondary">
            📋 Ver Regulamento
          </Link>
        </div>

        {/* Quick Stats / Info */}
        <div className="stats-grid" style={{ marginTop: "4rem", maxWidth: "800px" }}>
          <div className="stat-card" style={{ textAlign: "center" }}>
            <div className="stat-value">6.500</div>
            <div className="stat-label">Meticais em Prémios</div>
          </div>
          <div className="stat-card" style={{ textAlign: "center" }}>
            <div className="stat-value">80 MT</div>
            <div className="stat-label">Valor da Inscrição</div>
          </div>
          <div className="stat-card" style={{ textAlign: "center" }}>
            <div className="stat-value">S2</div>
            <div className="stat-label">Season 2</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section" style={{ background: "var(--bg-darker)" }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Como Participar</h2>
            <p className="section-subtitle">Simples, rápido e competitivo</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
            <div className="card">
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📝</div>
              <h3 style={{ marginBottom: "0.5rem" }}>1. Contacta o Admin</h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Clica no botão de inscrição para falar diretamente no WhatsApp (+258 86 029 9071).
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>💰</div>
              <h3 style={{ marginBottom: "0.5rem" }}>2. Faz o Pagamento</h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Envia o valor da inscrição (80 MT) e o comprovativo para garantir a vaga.
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🎯</div>
              <h3 style={{ marginBottom: "0.5rem" }}>3. Compete e Vence</h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Entra na sala, joga o Battle Royale e luta pelo prémio de 6.500 MT!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container" style={{ textAlign: "center" }}>
          <h2 className="section-title">Pronto para a Batalha?</h2>
          <p className="section-subtitle" style={{ marginBottom: "2rem" }}>
            As vagas são limitadas. Garante a tua presença na Season 2!
          </p>
          <Link href="/inscricao" className="btn btn-primary" style={{ padding: "1rem 3rem", fontSize: "1.125rem" }}>
            Inscrever Agora
          </Link>
        </div>
      </section>

      {/* Quick Links */}
      <section className="section" style={{ background: "var(--bg-darker)", paddingBottom: "4rem" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <Link href="/equipas" className="card" style={{ textAlign: "center", textDecoration: "none" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>👥</div>
              <div style={{ fontWeight: 600 }}>Equipas Inscritas</div>
            </Link>
            <Link href="/classificacao" className="card" style={{ textAlign: "center", textDecoration: "none" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🏆</div>
              <div style={{ fontWeight: 600 }}>Classificação</div>
            </Link>
            <Link href="/mvp" className="card" style={{ textAlign: "center", textDecoration: "none" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>⭐</div>
              <div style={{ fontWeight: 600 }}>Ranking MVP</div>
            </Link>
            <Link href="/regulamento" className="card" style={{ textAlign: "center", textDecoration: "none" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📋</div>
              <div style={{ fontWeight: 600 }}>Regulamento</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "3rem 2rem",
        textAlign: "center",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        color: "var(--text-muted)",
        background: "var(--bg-dark)"
      }}>
        <div style={{ marginBottom: "2rem" }}>
          <h4 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>Patrocinadores Oficiais</h4>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "1.5rem",
            color: "var(--cyan)",
            fontWeight: 600,
            letterSpacing: "0.05em"
          }}>
            <span>OFF MORENA</span>
            <span>•</span>
            <span>DP CORONA</span>
            <span>•</span>
            <span>OFF QUEEN</span>
            <span>•</span>
            <span>WARLOCK RIP</span>
          </div>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <p style={{ marginBottom: "0.5rem" }}>Instagram: <a href="https://instagram.com/Queencampff" target="_blank" rel="noopener noreferrer" style={{ color: "var(--pink)" }}>@Queencampff</a></p>
          <p>Parceiro: <span style={{ color: "var(--purple)" }}>Aposta Royale</span></p>
        </div>

        <p style={{ fontSize: "0.875rem", opacity: 0.6 }}>
          © 2026 Copa Queen. Todos os direitos reservados.
        </p>
      </footer>
    </>
  );
}
