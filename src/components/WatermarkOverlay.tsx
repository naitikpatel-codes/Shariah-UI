interface Props { email: string; }

export function WatermarkOverlay({ email }: Props) {
    const text = `${email}  ·  CONFIDENTIAL  ·  FORTIV SOLUTIONS`;

    return (
        <div
            className="absolute inset-0 z-20 pointer-events-none overflow-hidden select-none"
            aria-hidden="true"
        >
            {/* Diagonal tiled watermark using CSS transform */}
            {Array.from({ length: 12 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute whitespace-nowrap"
                    style={{
                        top: `${(i * 9) - 5}%`,
                        left: '-20%',
                        width: '150%',
                        transform: 'rotate(-30deg)',
                        fontSize: '11px',
                        color: 'rgba(23, 131, 223, 0.08)',  // #1783DF at 8% opacity
                        fontFamily: 'monospace',
                        fontWeight: '700',
                        letterSpacing: '3px',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                    }}
                >
                    {text.repeat(4)}
                </div>
            ))}
        </div>
    );
}
