import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Input, Button } from '../../design-system';
import { useGenerate } from '../../hooks/useGenerate';
import { useUiStore } from '../../store/ui-store';

export function NameInput() {
  const [name, setName] = useState('');
  const { generate, importPerson } = useGenerate();
  const loading = useUiStore((s) => s.loading);
  const error = useUiStore((s) => s.error);
  const progress = useUiStore((s) => s.generationProgress);
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim() && !loading) {
      generate(name.trim());
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!data.person || !data.graph) {
          throw new Error('Invalid file format');
        }
        importPerson(data);
      } catch {
        useUiStore.getState().setError('Invalid JSON file. Please select a valid exported person file.');
      }
    };
    reader.readAsText(file);
    // Reset so same file can be re-imported
    e.target.value = '';
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: 24,
        padding: 40,
        position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <Button onClick={toggleTheme} size="sm">{theme === 'dark' ? 'Light' : 'Dark'}</Button>
      </div>
      <div style={{ textAlign: 'center', maxWidth: 520 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 8px' }}>
          Cognitive Map
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 15, margin: '0 0 32px', lineHeight: 1.5 }}>
          Explore the latent space cognitive architecture of any notable person.
          Enter a name to generate an interactive visualization of their intellectual landscape.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 640 }}>
        <Input
          fullWidth
          placeholder="Enter a person's name (e.g., Mark Twain)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          autoFocus
          style={{ flex: 1 }}
        />
        <Button
          variant="primary"
          type="submit"
          disabled={loading || !name.trim()}
          style={{ padding: '12px 24px', fontSize: 14 }}
        >
          {loading ? 'Generating...' : 'Generate'}
        </Button>
        <Button
          onClick={handleImport}
          disabled={loading}
          style={{ padding: '12px 24px', fontSize: 14 }}
        >
          Import
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </form>

      {progress && (
        <div style={{ color: 'var(--accent)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', width: 16, height: 16, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%' }} />
          {progress}
        </div>
      )}

      {error && (
        <div style={{ color: 'var(--danger)', fontSize: 14, maxWidth: 640, textAlign: 'center' }}>
          {error}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
