import { useEffect, useRef, useCallback } from 'react';
import { useGraphStore } from '../../store/graph-store';
import { useUiStore } from '../../store/ui-store';
import { CLUSTER_COLORS } from './graph-styles';
import type { GraphNode, GraphEdge, ClusterType } from '../../api/client';

interface SimNode extends GraphNode {
  sx: number;
  sy: number;
  vx: number;
  vy: number;
}

const ANCHOR_BY_CLUSTER: Record<ClusterType, { x: number; y: number }> = {
  technical: { x: 0.58, y: 0.44 },
  strategic: { x: 0.39, y: 0.46 },
  reflective: { x: 0.23, y: 0.55 },
  macro: { x: 0.63, y: 0.50 },
};

function hexToRgba(hex: string, alpha: number): string {
  const v = hex.replace('#', '');
  const bigint = parseInt(v, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v));
}

export function CytoscapeGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const simNodesRef = useRef<SimNode[]>([]);
  const nodesMapRef = useRef<Map<string, SimNode>>(new Map());
  const animRef = useRef<number>(0);
  const stateRef = useRef({
    hoveredNode: null as SimNode | null,
    hoveredEdge: null as GraphEdge | null,
    draggingNode: null as SimNode | null,
    selected: null as SimNode | GraphEdge | null,
  });

  const graph = useGraphStore((s) => s.graph);
  const selectNode = useGraphStore((s) => s.selectNode);
  const selectEdge = useGraphStore((s) => s.selectEdge);
  const clearSelection = useGraphStore((s) => s.clearSelection);
  const selectedNode = useGraphStore((s) => s.selectedNode);
  const selectedEdge = useGraphStore((s) => s.selectedEdge);

  const theme = useUiStore((s) => s.theme);
  const activeClusters = useUiStore((s) => s.activeClusters);
  const bridgesOnly = useUiStore((s) => s.bridgesOnly);
  const recentOnly = useUiStore((s) => s.recentOnly);
  const strongLinks = useUiStore((s) => s.strongLinks);
  const monthIndex = useUiStore((s) => s.monthIndex);
  const timeMode = useUiStore((s) => s.timeMode);

  // Store filter state in refs for animation loop access
  const filtersRef = useRef({ activeClusters, bridgesOnly, recentOnly, strongLinks, monthIndex, timeMode, theme });
  filtersRef.current = { activeClusters, bridgesOnly, recentOnly, strongLinks, monthIndex, timeMode, theme };

  const selectedRef = useRef({ selectedNode, selectedEdge });
  selectedRef.current = { selectedNode, selectedEdge };

  const getNodeValue = useCallback((n: SimNode): number => {
    const f = filtersRef.current;
    const t = f.monthIndex;
    const trendVal = n.trend[t] ?? 0.5;
    return f.timeMode === 'recent' ? trendVal * 0.75 + n.momentum * 0.25 : trendVal;
  }, []);

  const nodeRadius = useCallback((n: SimNode): number => {
    return 18 + getNodeValue(n) * 26;
  }, [getNodeValue]);

  const isNodeVisible = useCallback((n: SimNode): boolean => {
    const f = filtersRef.current;
    if (!f.activeClusters.has(n.cluster)) return false;
    if (f.bridgesOnly && n.bridge < 0.75) return false;
    if (f.recentOnly && n.momentum < 0.7) return false;
    return true;
  }, []);

  const isEdgeVisible = useCallback((e: GraphEdge): boolean => {
    const f = filtersRef.current;
    if (f.strongLinks && e.weight < 0.72) return false;
    if (f.recentOnly && e.recentChange < 0.1) return false;
    const src = nodesMapRef.current.get(e.source);
    const tgt = nodesMapRef.current.get(e.target);
    if (!src || !tgt) return false;
    return isNodeVisible(src) && isNodeVisible(tgt);
  }, [isNodeVisible]);

  // Initialize simulation nodes when graph changes, centering in canvas
  useEffect(() => {
    if (!graph) return;

    const pad = 0.1;
    const usable = 1 - pad * 2; // 0.8

    // Find bounding box of raw positions
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const n of graph.nodes) {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    }
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;

    const simNodes = graph.nodes.map((n) => {
      // Normalize to 0..1 within bounding box, then scale to padded area
      const nx = pad + ((n.x - minX) / rangeX) * usable;
      const ny = pad + ((n.y - minY) / rangeY) * usable;
      return {
        ...n,
        x: nx,
        y: ny,
        sx: nx,
        sy: ny,
        vx: 0,
        vy: 0,
      };
    });
    simNodesRef.current = simNodes;
    const map = new Map<string, SimNode>();
    for (const n of simNodes) map.set(n.id, n);
    nodesMapRef.current = map;
  }, [graph]);

  // Set up canvas size
  const setCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  const screenPos = useCallback((n: SimNode) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: n.sx * rect.width, y: n.sy * rect.height };
  }, []);

  // Physics simulation
  const updateSimulation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nodes = simNodesRef.current;
    const edges = graph?.edges || [];
    const nodesMap = nodesMapRef.current;
    const st = stateRef.current;

    const visNodes = nodes.filter(isNodeVisible);
    const visEdges = edges.filter(isEdgeVisible);
    const f = filtersRef.current;

    // Attract to original position + cluster anchor
    for (const n of visNodes) {
      const anchor = ANCHOR_BY_CLUSTER[n.cluster];
      let driftX = 0;
      let driftY = 0;
      if (f.timeMode === 'playback') {
        const d = (f.monthIndex - 1.5) * 0.013;
        driftX = n.cluster === 'technical' ? -d : n.cluster === 'macro' ? d : 0;
        driftY = n.role === 'Emergent' ? -d : n.role === 'Core' ? d * 0.4 : 0;
      }
      const targetX = n.x + driftX;
      const targetY = n.y + driftY;
      if (st.draggingNode === n) continue;
      n.vx += (targetX - n.sx) * 0.012;
      n.vy += (targetY - n.sy) * 0.012;
      n.vx += (anchor.x - n.sx) * 0.002;
      n.vy += (anchor.y - n.sy) * 0.002;
    }

    // Repulsion between nodes
    for (let i = 0; i < visNodes.length; i++) {
      for (let j = i + 1; j < visNodes.length; j++) {
        const a = visNodes[i]!;
        const b = visNodes[j]!;
        const dx = b.sx - a.sx;
        const dy = b.sy - a.sy;
        const dist = Math.hypot(dx, dy) + 1e-6;
        const min = (nodeRadius(a) + nodeRadius(b)) / Math.max(rect.width, rect.height) * 1.1;
        if (dist < min) {
          const push = (min - dist) * 0.012;
          const ux = dx / dist;
          const uy = dy / dist;
          if (st.draggingNode !== a) { a.vx -= ux * push; a.vy -= uy * push; }
          if (st.draggingNode !== b) { b.vx += ux * push; b.vy += uy * push; }
        }
      }
    }

    // Edge spring forces
    for (const e of visEdges) {
      const a = nodesMap.get(e.source);
      const b = nodesMap.get(e.target);
      if (!a || !b) continue;
      const dx = b.sx - a.sx;
      const dy = b.sy - a.sy;
      const dist = Math.hypot(dx, dy) + 1e-6;
      const desired = 0.18 + (1 - e.weight) * 0.16;
      const force = (dist - desired) * 0.004;
      const ux = dx / dist;
      const uy = dy / dist;
      if (st.draggingNode !== a) { a.vx += ux * force; a.vy += uy * force; }
      if (st.draggingNode !== b) { b.vx -= ux * force; b.vy -= uy * force; }
    }

    // Dampen and integrate
    for (const n of visNodes) {
      if (st.draggingNode === n) continue;
      n.vx *= 0.92;
      n.vy *= 0.92;
      n.sx = clamp(n.sx + n.vx, 0.08, 0.92);
      n.sy = clamp(n.sy + n.vy, 0.08, 0.9);
    }
  }, [graph, isNodeVisible, isEdgeVisible, nodeRadius]);

  // Draw
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const nodes = simNodesRef.current;
    const edges = graph?.edges || [];
    const nodesMap = nodesMapRef.current;
    const st = stateRef.current;
    const sel = selectedRef.current;

    ctx.clearRect(0, 0, rect.width, rect.height);

    const isLight = filtersRef.current.theme === 'light';

    // Star background
    for (let i = 0; i < 55; i++) {
      const x = (i * 137) % rect.width;
      const y = ((i * 83) + 44) % rect.height;
      ctx.beginPath();
      ctx.arc(x, y, 1 + (i % 2), 0, Math.PI * 2);
      ctx.fillStyle = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)';
      ctx.fill();
    }

    // Draw edges
    const visEdges = edges.filter(isEdgeVisible);
    for (const e of visEdges) {
      const aSim = nodesMap.get(e.source);
      const bSim = nodesMap.get(e.target);
      if (!aSim || !bSim) continue;
      const a = screenPos(aSim);
      const b = screenPos(bSim);
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2 - 22;
      const thickness = 1 + e.weight * 5;

      // Glow edge
      const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      grad.addColorStop(0, 'rgba(136,182,255,0.18)');
      grad.addColorStop(0.5, 'rgba(211,171,255,0.16)');
      grad.addColorStop(1, 'rgba(255,196,140,0.16)');
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(midX, midY, b.x, b.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = thickness + 4;
      ctx.stroke();

      // Core edge
      const isSelectedEdge = sel.selectedEdge &&
        sel.selectedEdge.source === e.source && sel.selectedEdge.target === e.target;
      const isHovered = st.hoveredEdge === e;
      const alpha = isSelectedEdge || isHovered ? 0.9 : 0.22 + e.recentChange * 1.4;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(midX, midY, b.x, b.y);
      ctx.strokeStyle = `rgba(190, 214, 255, ${Math.min(alpha, 0.92)})`;
      ctx.lineWidth = thickness;
      ctx.stroke();

      // Animated particle on high-change edges
      if (e.recentChange > 0.14) {
        const t = (Date.now() / 700 + e.weight * 10) % 1;
        const qx = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * midX + t * t * b.x;
        const qy = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * midY + t * t * b.y;
        ctx.beginPath();
        ctx.arc(qx, qy, 3.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(187,220,255,0.95)';
        ctx.fill();
      }
    }

    // Draw nodes
    const visNodes = nodes.filter(isNodeVisible);
    for (const n of visNodes) {
      const p = screenPos(n);
      const r = nodeRadius(n);
      const color = CLUSTER_COLORS[n.cluster] || '#8ab7ff';
      const isSelectedNode = sel.selectedNode?.id === n.id;
      const isHovered = st.hoveredNode === n;
      const active = isSelectedNode || isHovered;

      // Outer glow
      const glow = ctx.createRadialGradient(p.x, p.y, r * 0.2, p.x, p.y, r + 18 + n.momentum * 9);
      glow.addColorStop(0, hexToRgba(color, active ? 0.25 : 0.17));
      glow.addColorStop(1, hexToRgba(color, 0));
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 18 + n.momentum * 8, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Bridge outline
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 4, 0, Math.PI * 2);
      ctx.strokeStyle = hexToRgba('#ffffff', 0.12 + n.bridge * 0.46);
      ctx.lineWidth = 1 + n.bridge * 3;
      ctx.stroke();

      // Node body gradient
      const bodyGrad = ctx.createLinearGradient(p.x - r, p.y - r, p.x + r, p.y + r);
      bodyGrad.addColorStop(0, hexToRgba(color, active ? 1 : 0.94));
      bodyGrad.addColorStop(1, hexToRgba('#ffffff', active ? 0.55 : 0.26));
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Specular highlight
      ctx.beginPath();
      ctx.arc(p.x - r * 0.28, p.y - r * 0.28, r * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.14)';
      ctx.fill();

      // Label
      ctx.font = `${active ? 700 : 600} 13px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = isLight ? '#1d1d1f' : '#eff4ff';
      ctx.fillText(n.label, p.x, p.y + r + 21);

      // Role
      ctx.font = '12px Inter, system-ui, sans-serif';
      ctx.fillStyle = isLight ? 'rgba(29,29,31,0.6)' : 'rgba(232,237,248,0.76)';
      ctx.fillText(n.role, p.x, p.y + r + 36);
    }
  }, [graph, isNodeVisible, isEdgeVisible, nodeRadius, screenPos]);

  // Hit-test helpers
  const pickNode = useCallback((mx: number, my: number): SimNode | null => {
    const nodes = simNodesRef.current;
    for (const n of nodes.filter(isNodeVisible)) {
      const p = screenPos(n);
      if (Math.hypot(mx - p.x, my - p.y) <= nodeRadius(n) + 6) return n;
    }
    return null;
  }, [isNodeVisible, screenPos, nodeRadius]);

  const pickEdge = useCallback((mx: number, my: number): GraphEdge | null => {
    const edges = graph?.edges || [];
    const nodesMap = nodesMapRef.current;
    for (const e of edges.filter(isEdgeVisible)) {
      const aSim = nodesMap.get(e.source);
      const bSim = nodesMap.get(e.target);
      if (!aSim || !bSim) continue;
      const a = screenPos(aSim);
      const b = screenPos(bSim);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 22 };
      let minDist = Infinity;
      for (let i = 0; i <= 36; i++) {
        const t = i / 36;
        const x = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * mid.x + t * t * b.x;
        const y = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * mid.y + t * t * b.y;
        minDist = Math.min(minDist, Math.hypot(mx - x, my - y));
      }
      if (minDist < 8) return e;
    }
    return null;
  }, [graph, isEdgeVisible, screenPos]);

  // Animation loop
  useEffect(() => {
    if (!graph) return;
    setCanvasSize();

    const animate = () => {
      updateSimulation();
      draw();
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    const handleResize = () => { setCanvasSize(); draw(); };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [graph, setCanvasSize, updateSimulation, draw]);

  // Mouse events
  const updateTooltip = useCallback((mx: number, my: number) => {
    const tooltip = tooltipRef.current;
    const wrap = wrapRef.current;
    if (!tooltip || !wrap) return;
    const st = stateRef.current;
    const rect = wrap.getBoundingClientRect();

    if (st.hoveredNode) {
      tooltip.innerHTML = `<strong>${st.hoveredNode.label}</strong><div style="margin-top:6px; color:var(--muted);">${st.hoveredNode.excerpt}</div>`;
    } else if (st.hoveredEdge) {
      const nodesMap = nodesMapRef.current;
      const a = nodesMap.get(st.hoveredEdge.source);
      const b = nodesMap.get(st.hoveredEdge.target);
      tooltip.innerHTML = `<strong>${a?.label || ''} ↔ ${b?.label || ''}</strong><div style="margin-top:6px; color:var(--muted);">${st.hoveredEdge.excerpt}</div>`;
    } else {
      tooltip.style.opacity = '0';
      tooltip.style.transform = 'translateY(4px)';
      return;
    }
    tooltip.style.left = Math.min(mx + 18, rect.width - 330) + 'px';
    tooltip.style.top = Math.min(my + 18, rect.height - 120) + 'px';
    tooltip.style.opacity = '1';
    tooltip.style.transform = 'translateY(0)';
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const st = stateRef.current;

    if (st.draggingNode) {
      st.draggingNode.sx = clamp(mx / rect.width, 0.08, 0.92);
      st.draggingNode.sy = clamp(my / rect.height, 0.08, 0.9);
      st.draggingNode.x = st.draggingNode.sx;
      st.draggingNode.y = st.draggingNode.sy;
      updateTooltip(mx, my);
      return;
    }

    st.hoveredNode = pickNode(mx, my);
    st.hoveredEdge = st.hoveredNode ? null : pickEdge(mx, my);
    canvas.style.cursor = st.hoveredNode ? 'grab' : st.hoveredEdge ? 'pointer' : 'default';
    updateTooltip(mx, my);
  }, [pickNode, pickEdge, updateTooltip]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const st = stateRef.current;

    const node = pickNode(mx, my);
    if (node) {
      st.draggingNode = node;
      canvas.style.cursor = 'grabbing';
      // Select the node in the store
      const graphNode = graph?.nodes.find((n) => n.id === node.id);
      if (graphNode) selectNode(graphNode);
    }
  }, [pickNode, graph, selectNode]);

  const handleMouseUp = useCallback(() => {
    const st = stateRef.current;
    st.draggingNode = null;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = st.hoveredNode ? 'grab' : 'default';
    }
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const node = pickNode(mx, my);
    if (node) {
      const graphNode = graph?.nodes.find((n) => n.id === node.id);
      if (graphNode) selectNode(graphNode);
      return;
    }

    const edge = pickEdge(mx, my);
    if (edge) {
      selectEdge(edge);
      return;
    }

    clearSelection();
  }, [pickNode, pickEdge, graph, selectNode, selectEdge, clearSelection]);

  const handleMouseLeave = useCallback(() => {
    const tooltip = tooltipRef.current;
    if (tooltip) {
      tooltip.style.opacity = '0';
      tooltip.style.transform = 'translateY(4px)';
    }
    stateRef.current.hoveredNode = null;
    stateRef.current.hoveredEdge = null;
  }, []);

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onMouseLeave={handleMouseLeave}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      <div
        ref={tooltipRef}
        style={{
          position: 'absolute',
          maxWidth: 320,
          pointerEvents: 'none',
          padding: '10px 12px',
          borderRadius: 14,
          border: '1px solid var(--border)',
          background: 'var(--panel)',
          boxShadow: 'var(--shadow-tooltip)',
          color: 'var(--text)',
          fontSize: 12,
          lineHeight: 1.4,
          opacity: 0,
          transform: 'translateY(4px)',
          transition: 'opacity 0.12s ease, transform 0.12s ease',
          zIndex: 100,
        }}
      />
    </div>
  );
}
