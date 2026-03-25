interface SparkLineProps {
  values: number[];
  labels?: string[];
}

export function SparkLine({ values, labels }: SparkLineProps) {
  const w = 300;
  const h = 54;
  const p = 6;

  const pts = values.map((v, i) => {
    const x = p + i * ((w - p * 2) / (values.length - 1));
    const y = h - p - v * (h - p * 2);
    return [x, y] as [number, number];
  });

  const line = pts.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt[0]} ${pt[1]}`).join(' ');

  return (
    <div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={{
          width: '100%',
          height: 54,
          display: 'block',
          borderRadius: 10,
          background: 'var(--subtle-bg)',
          marginTop: 8,
        }}
      >
        <defs>
          <linearGradient id="sparkGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="#8ab7ff" />
            <stop offset="100%" stopColor="#c39cff" />
          </linearGradient>
        </defs>
        <path d={`M ${p} ${h - p} L ${w - p} ${h - p}`} stroke="var(--bar-track)" fill="none" />
        <path d={line} stroke="url(#sparkGrad)" strokeWidth="3" fill="none" />
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.5" fill="var(--accent)" />
        ))}
      </svg>
      {labels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {labels.map((l) => (
            <span key={l} style={{ fontSize: 'var(--font-xs)', color: 'var(--muted)' }}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}
