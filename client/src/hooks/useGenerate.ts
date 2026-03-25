import { useCallback } from 'react';
import { api } from '../api/client';
import { useGraphStore } from '../store/graph-store';
import { useUiStore } from '../store/ui-store';

export function useGenerate() {
  const setPerson = useGraphStore((s) => s.setPerson);
  const setScreen = useUiStore((s) => s.setScreen);
  const setLoading = useUiStore((s) => s.setLoading);
  const setError = useUiStore((s) => s.setError);
  const setGenerationProgress = useUiStore((s) => s.setGenerationProgress);

  const generate = useCallback(
    async (name: string) => {
      setLoading(true);
      setError(null);
      setGenerationProgress('Verifying on Wikipedia...');

      try {
        const result = await api.generate(name);
        setPerson(result.person, result.version, result.graph, result.context, result.cached);
        setGenerationProgress(null);
        setScreen('graph');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Generation failed');
        setGenerationProgress(null);
      } finally {
        setLoading(false);
      }
    },
    [setPerson, setScreen, setLoading, setError, setGenerationProgress]
  );

  const regenerate = useCallback(
    async (personId: number) => {
      setLoading(true);
      setError(null);
      setGenerationProgress('Regenerating cognitive map...');

      try {
        const result = await api.regenerate(personId);
        setPerson(result.person, result.version, result.graph, result.context, result.cached);
        setGenerationProgress(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Regeneration failed');
        setGenerationProgress(null);
      } finally {
        setLoading(false);
      }
    },
    [setPerson, setLoading, setError, setGenerationProgress]
  );

  const importPerson = useCallback(
    async (data: Parameters<typeof api.importPerson>[0]) => {
      setLoading(true);
      setError(null);
      setGenerationProgress('Importing person...');

      try {
        const result = await api.importPerson(data);
        setPerson(result.person, result.version, result.graph, result.context, result.cached);
        setGenerationProgress(null);
        setScreen('graph');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Import failed');
        setGenerationProgress(null);
      } finally {
        setLoading(false);
      }
    },
    [setPerson, setScreen, setLoading, setError, setGenerationProgress]
  );

  return { generate, regenerate, importPerson };
}
