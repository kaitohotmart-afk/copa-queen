"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Team = {
    id: string;
    name: string;
    tag: string;
    status: string;
    created_at: string;
};

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalTeams: 0,
        confirmedTeams: 0,
        pendingTeams: 0,
        totalPlayers: 0,
        totalKills: 0,
        totalBooyahs: 0,
    });
    const [recentTeams, setRecentTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch teams
            const { data: teamsData, error: teamsError } = await supabase
                .from("teams")
                .select("id, name, tag, status, created_at, booyahs, team_kills")
                .order("created_at", { ascending: false });

            if (teamsError) throw teamsError;

            const teams = teamsData || [];
            const confirmed = teams.filter(t => t.status === "confirmed").length;
            const pending = teams.filter(t => t.status === "pending").length;
            const totalBooyahs = teams.reduce((acc, t) => acc + (t.booyahs || 0), 0);
            const totalTeamKills = teams.reduce((acc, t) => acc + (t.team_kills || 0), 0);

            // Fetch player count
            const { count: playerCount } = await supabase
                .from("players")
                .select("*", { count: "exact", head: true });

            setStats({
                totalTeams: teams.length,
                confirmedTeams: confirmed,
                pendingTeams: pending,
                totalPlayers: playerCount || 0,
                totalKills: totalTeamKills,
                totalBooyahs,
            });

            setRecentTeams(teams.slice(0, 5));
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
    };

    if (isLoading) {
        return <div style={{ padding: "2rem", textAlign: "center" }}>Carregando...</div>;
    }

    return (
        <div>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Dashboard</h1>
                <p style={{ color: "var(--text-secondary)" }}>Visão geral do campeonato</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{stats.totalTeams}</div>
                    <div className="stat-label">Total de Equipas</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: "var(--status-confirmed)" }}>
                        {stats.confirmedTeams}
                    </div>
                    <div className="stat-label">Confirmadas</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: "var(--status-pending)" }}>
                        {stats.pendingTeams}
                    </div>
                    <div className="stat-label">Pendentes</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.totalPlayers}</div>
                    <div className="stat-label">Jogadores</div>
                </div>
            </div>

            {/* Game Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                <div className="card" style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "2rem" }}>🔫</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{stats.totalKills}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Kills Totais</div>
                </div>
                <div className="card" style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "2rem" }}>🏆</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{stats.totalBooyahs}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>BOOYAH Totais</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card" style={{ marginBottom: "2rem" }}>
                <h3 style={{ marginBottom: "1rem" }}>Ações Rápidas</h3>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <Link href="/admin/equipas" className="btn btn-secondary">
                        👥 Gerir Equipas
                    </Link>
                    <Link href="/admin/nova-equipa" className="btn btn-secondary" style={{ borderColor: "var(--cyan)", color: "var(--cyan)" }}>
                        ➕ Inscrever Equipa
                    </Link>
                    <Link href="/admin/pontuacao" className="btn btn-secondary">
                        🎯 Editar Pontuação
                    </Link>
                    <Link href="/admin/mvp" className="btn btn-secondary">
                        ⭐ Gerir MVP
                    </Link>
                    <Link href="/admin/regulamento" className="btn btn-secondary">
                        📋 Editar Regulamento
                    </Link>
                </div>
            </div>

            {/* Recent Teams */}
            <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h3>Inscrições Recentes</h3>
                    <Link href="/admin/equipas" style={{ color: "var(--purple)", textDecoration: "none", fontSize: "0.875rem" }}>
                        Ver todas →
                    </Link>
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Equipa</th>
                                <th>Tag</th>
                                <th>Status</th>
                                <th>Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTeams.map((team) => (
                                <tr key={team.id}>
                                    <td style={{ fontWeight: 600 }}>{team.name}</td>
                                    <td style={{ color: "var(--purple)" }}>[{team.tag}]</td>
                                    <td>
                                        <span className={`status-badge status-${team.status}`}>
                                            {team.status === "confirmed" ? "🟢 Confirmada" : team.status === "rejected" ? "🔴 Rejeitada" : "🟡 Pendente"}
                                        </span>
                                    </td>
                                    <td style={{ color: "var(--text-muted)" }}>{formatDate(team.created_at)}</td>
                                </tr>
                            ))}
                            {recentTeams.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                                        Nenhuma equipa inscrita ainda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
