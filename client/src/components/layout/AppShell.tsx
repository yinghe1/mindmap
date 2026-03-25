import type { ReactNode } from 'react';

interface AppShellProps {
  sidebar: ReactNode;
  main: ReactNode;
  detail: ReactNode;
}

export function AppShell({ sidebar, main, detail }: AppShellProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr 360px',
        height: '100vh',
      }}
    >
      <aside
        style={{
          background: 'var(--panel)',
          borderRight: '1px solid var(--border)',
          backdropFilter: 'blur(18px)',
          overflowY: 'auto',
          padding: 18,
        }}
      >
        {sidebar}
      </aside>
      <main style={{ display: 'grid', gridTemplateRows: 'auto 1fr auto', minWidth: 0 }}>
        {main}
      </main>
      <aside
        style={{
          background: 'var(--panel)',
          borderLeft: '1px solid var(--border)',
          backdropFilter: 'blur(18px)',
          overflowY: 'auto',
          padding: 18,
        }}
      >
        {detail}
      </aside>
    </div>
  );
}
