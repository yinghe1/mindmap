import { useCallback } from 'react';
import { api } from '../api/client';
import { useGraphStore } from '../store/graph-store';
import { useUiStore } from '../store/ui-store';

export function usePerson() {
  const setPerson = useGraphStore((s) => s.setPerson);
  const setScreen = useUiStore((s) => s.setScreen);
  const setLoading = useUiStore((s) => s.setLoading);
  const setError = useUiStore((s) => s.setError);

  const loadPerson = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);

      try {
        const result = await api.getPerson(id);
        setPerson(result.person, result.version, result.graph, result.context, false);
        setScreen('graph');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load person');
      } finally {
        setLoading(false);
      }
    },
    [setPerson, setScreen, setLoading, setError]
  );

  return { loadPerson };
}
