interface StatusBadgeProps {
    status: "confirmed" | "pending" | "rejected";
}

export function StatusBadge({ status }: StatusBadgeProps) {
    return (
        <span className={`status-badge status-${status}`}>
            {status === "confirmed" && (
                <>
                    <span>🟢</span>
                    Confirmada
                </>
            )}
            {status === "pending" && (
                <>
                    <span>🟡</span>
                    Pendente
                </>
            )}
            {status === "rejected" && (
                <>
                    <span>🔴</span>
                    Rejeitada
                </>
            )}
        </span>
    );
}
