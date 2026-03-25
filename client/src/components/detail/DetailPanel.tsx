import { useGraphStore } from '../../store/graph-store';
import { useUiStore } from '../../store/ui-store';
import { Overview } from './Overview';
import { NodeDetail } from './NodeDetail';
import { EdgeDetail } from './EdgeDetail';
import { CognitiveArchitecturePanel } from './CognitiveArchitecture';

export function DetailPanel() {
  const selectedNode = useGraphStore((s) => s.selectedNode);
  const selectedEdge = useGraphStore((s) => s.selectedEdge);
  const setShowPatterns = useUiStore((s) => s.setShowPatterns);

  return (
    <>
      {selectedNode ? (
        <NodeDetail node={selectedNode} />
      ) : selectedEdge ? (
        <EdgeDetail edge={selectedEdge} />
      ) : (
        <Overview onShowPatterns={() => setShowPatterns(true)} />
      )}
      <CognitiveArchitecturePanel />
    </>
  );
}
