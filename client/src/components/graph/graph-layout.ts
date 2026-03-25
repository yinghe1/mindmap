import type { LayoutOptions } from 'cytoscape';

export function getLayoutOptions(): LayoutOptions {
  return {
    name: 'cose',
    animate: true,
    animationDuration: 800,
    randomize: false,
    nodeRepulsion: () => 8000,
    idealEdgeLength: () => 150,
    edgeElasticity: () => 100,
    gravity: 0.25,
    numIter: 300,
    padding: 50,
    nodeOverlap: 20,
    initialTemp: 200,
    coolingFactor: 0.95,
    minTemp: 1.0,
  } as LayoutOptions;
}

export function getPresetLayoutOptions(
  positions: Record<string, { x: number; y: number }>,
  containerWidth: number,
  containerHeight: number
): LayoutOptions {
  return {
    name: 'preset',
    positions: (node) => {
      const id = node.id();
      const pos = positions[id];
      if (pos) {
        return {
          x: pos.x * containerWidth,
          y: pos.y * containerHeight,
        };
      }
      return { x: containerWidth / 2, y: containerHeight / 2 };
    },
    animate: true,
    animationDuration: 500,
  } as LayoutOptions;
}
