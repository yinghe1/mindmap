interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const sections = parseSections(content);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {sections.map((section, i) => (
        <Section key={i} section={section} index={i} />
      ))}
    </div>
  );
}

interface ParsedSection {
  level: number;        // 1 = h1, 2 = h2, 3 = h3, 0 = no heading (body only)
  heading: string;
  body: string[];       // lines of body content
}

function parseSections(content: string): ParsedSection[] {
  const lines = content.split('\n');
  const sections: ParsedSection[] = [];
  let current: ParsedSection | null = null;

  for (const line of lines) {
    const h4 = line.match(/^#{4,}\s+(.+)/);
    const h3 = line.match(/^###\s+(.+)/);
    const h2 = line.match(/^##\s+(.+)/);
    const h1 = line.match(/^#\s+(.+)/);

    if (h4 || h3 || h2 || h1) {
      if (current) sections.push(current);
      current = {
        level: h4 ? 3 : h3 ? 3 : h2 ? 2 : 1,
        heading: (h4?.[1] || h3?.[1] || h2?.[1] || h1?.[1] || '').trim(),
        body: [],
      };
    } else if (/^---+\s*$/.test(line.trim())) {
      // skip horizontal rules
    } else {
      if (!current) {
        current = { level: 0, heading: '', body: [] };
      }
      current.body.push(line);
    }
  }
  if (current) sections.push(current);

  return sections;
}

const SECTION_ACCENTS = [
  'var(--accent)',
  'var(--accent2)',
  'var(--strategic)',
  'var(--warn)',
  'var(--technical)',
  'var(--reflective)',
  'var(--macro)',
  'var(--good)',
];

function Section({ section, index }: { section: ParsedSection; index: number }) {
  const accent = SECTION_ACCENTS[index % SECTION_ACCENTS.length];
  const bodyElements = renderBody(section.body);
  const hasContent = bodyElements.length > 0;

  if (section.level === 1) {
    return (
      <div style={{ marginBottom: 4 }}>
        <h2 style={{
          margin: 0,
          fontSize: 'var(--font-xxl)',
          fontWeight: 700,
          color: 'var(--text)',
          letterSpacing: '-0.3px',
        }}>
          {section.heading}
        </h2>
        {hasContent && <div style={{ marginTop: 12 }}>{bodyElements}</div>}
      </div>
    );
  }

  if (section.level === 2) {
    return (
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 20px',
        borderLeft: `3px solid ${accent}`,
      }}>
        <div style={{
          fontSize: 'var(--font-lg)',
          fontWeight: 700,
          color: 'var(--text)',
          marginBottom: hasContent ? 10 : 0,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: accent,
            flexShrink: 0,
          }} />
          {section.heading}
        </div>
        {hasContent && <div style={{ paddingLeft: 16 }}>{bodyElements}</div>}
      </div>
    );
  }

  if (section.level === 3) {
    return (
      <div style={{
        background: 'var(--subtle-bg)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        border: '1px solid var(--chip)',
      }}>
        <div style={{
          fontSize: 'var(--font-md)',
          fontWeight: 600,
          color: accent,
          marginBottom: hasContent ? 8 : 0,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontSize: 'var(--font-xs)',
        }}>
          {section.heading}
        </div>
        {hasContent && <div>{bodyElements}</div>}
      </div>
    );
  }

  // level 0 — no heading, just body
  return hasContent ? <div>{bodyElements}</div> : null;
}

function renderBody(lines: string[]): JSX.Element[] {
  const elements: JSX.Element[] = [];
  let i = 0;

  // Trim leading/trailing empty lines
  while (i < lines.length && lines[i].trim() === '') i++;
  let end = lines.length - 1;
  while (end > i && lines[end].trim() === '') end--;
  const trimmed = lines.slice(i, end + 1);

  i = 0;
  while (i < trimmed.length) {
    const line = trimmed[i];

    // Unordered list
    if (/^\s*[-*]\s/.test(line)) {
      const items: JSX.Element[] = [];
      while (i < trimmed.length && /^\s*[-*]\s/.test(trimmed[i])) {
        const text = trimmed[i].replace(/^\s*[-*]\s/, '');
        items.push(
          <li key={i} style={{
            fontSize: 'var(--font-sm)',
            color: 'var(--muted)',
            lineHeight: 1.7,
            marginBottom: 4,
            paddingLeft: 4,
          }}>
            {processInline(text)}
          </li>
        );
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} style={{
          margin: '8px 0',
          paddingLeft: 18,
          listStyle: 'none',
        }}>
          {items.map((item, idx) => (
            <li key={idx} style={{
              ...item.props.style,
              position: 'relative',
              paddingLeft: 14,
            }}>
              <span style={{
                position: 'absolute',
                left: 0,
                top: '0.55em',
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: 'var(--accent)',
                opacity: 0.5,
              }} />
              {item.props.children}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\s*\d+[.)]\s/.test(line)) {
      const items: { text: string; num: string }[] = [];
      while (i < trimmed.length && /^\s*\d+[.)]\s/.test(trimmed[i])) {
        const match = trimmed[i].match(/^\s*(\d+)[.)]\s(.*)/)!;
        items.push({ num: match[1], text: match[2] });
        i++;
      }
      elements.push(
        <div key={`ol-${i}`} style={{ margin: '8px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{
                fontSize: 'var(--font-xs)',
                fontWeight: 700,
                color: 'var(--accent)',
                background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
                borderRadius: 'var(--radius-pill)',
                minWidth: 22,
                height: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: 1,
              }}>
                {item.num}
              </span>
              <span style={{ fontSize: 'var(--font-sm)', color: 'var(--muted)', lineHeight: 1.7 }}>
                {processInline(item.text)}
              </span>
            </div>
          ))}
        </div>
      );
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph
    elements.push(
      <p key={i} style={{
        fontSize: 'var(--font-sm)',
        color: 'var(--muted)',
        lineHeight: 1.7,
        margin: '6px 0',
      }}>
        {processInline(line)}
      </p>
    );
    i++;
  }

  return elements;
}

function processInline(text: string): (string | JSX.Element)[] {
  const parts: (string | JSX.Element)[] = [];
  // Process **bold** and *italic*
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push(
        <strong key={match.index} style={{ color: 'var(--text)', fontWeight: 600 }}>
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      parts.push(
        <em key={match.index} style={{ color: 'var(--accent2)', fontStyle: 'italic' }}>
          {match[3]}
        </em>
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}
