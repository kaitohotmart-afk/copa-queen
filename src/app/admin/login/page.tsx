"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            // TODO: Implement Supabase auth
            // For now, use demo credentials
            if (email === "admin@copaqueen.com" && password === "Queen@123") {
                // Store session (will be replaced with Supabase session)
                localStorage.setItem("admin_session", "true");
                router.push("/admin/dashboard");
            } else {
                setError("Credenciais inválidas");
            }
        } catch {
            setError("Erro ao fazer login. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
            }}
        >
            <div
                className="card"
                style={{
                    width: "100%",
                    maxWidth: "400px",
                    padding: "2.5rem",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <h1
                        style={{
                            fontSize: "1.75rem",
                            background: "var(--gradient-primary)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            marginBottom: "0.5rem",
                        }}
                    >
                        COPA QUEEN
                    </h1>
                    <p style={{ color: "var(--text-muted)" }}>Painel Administrativo</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="form-group" style={{ marginBottom: "1rem" }}>
                        <label className="label">Email</label>
                        <input
                            type="email"
                            className="input"
                            placeholder="admin@copaqueen.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                        <label className="label">Senha</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && (
                        <div
                            style={{
                                background: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                color: "var(--status-error)",
                                padding: "0.75rem",
                                borderRadius: "0.5rem",
                                marginBottom: "1rem",
                                fontSize: "0.875rem",
                                textAlign: "center",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%" }}
                        disabled={isLoading}
                    >
                        {isLoading ? "Entrando..." : "Entrar"}
                    </button>
                </form>


            </div>
        </div >
    );
}
