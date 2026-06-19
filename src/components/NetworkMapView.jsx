import { useRef, useEffect, useState, useCallback } from 'react';
import { getMeasures, localized, highestTier } from '../data/grip.js';
import { t } from '../i18n/strings.js';

// ── Simulation constants ──────────────────────────────────────────────────
const REPULSION = 2200;
const LINK_DIST = 110;
const LINK_K = 0.045;
const CENTER_K = 0.008;
const DAMPING = 0.78;
const ALPHA_DECAY = 0.97;
const ALPHA_MIN = 0.001;
const MEASURE_R = 18;
const PRODUCT_R = 12; // base radius; main hub products grow with their degree
const PRODUCT_R_MAX = 26;
const PRODUCT_R_PER_DEGREE = 1.6; // radius added per extra connected measure
const DRAG_THRESHOLD = 5; // px before a click becomes a drag
const TIER_RANK = { A1: 0, A3: 1, A5: 2 };

// ── Helpers ───────────────────────────────────────────────────────────────

// A product entry's name may carry a " — sub-feature" suffix (e.g.
// "Microsoft Purview Compliance Manager — DPIA templates"). Collapse those onto
// the main product so the graph shows one node per product.
function mainProductName(name) {
  return name.split(/\s+—\s+/)[0];
}

function shortProductName(name) {
  // Strip the "Microsoft " prefix (appears in many names) for a compact label.
  return name.replace(/^Microsoft\s+/, '');
}

// ── Graph construction ────────────────────────────────────────────────────

function buildGraph() {
  const measures = getMeasures();

  // Collect unique *main* products, keeping the highest tier per product.
  const productMap = new Map();
  for (const m of measures) {
    for (const item of m.microsoft) {
      const name = mainProductName(item.name);
      const prev = productMap.get(name);
      if (!prev || TIER_RANK[item.tier] > TIER_RANK[prev.tier]) {
        productMap.set(name, { name, tier: item.tier });
      }
    }
  }

  // Build links (one per measure↔main-product pair) and count product degree.
  const links = [];
  const degree = new Map();
  for (const m of measures) {
    const seen = new Set();
    for (const item of m.microsoft) {
      const name = mainProductName(item.name);
      if (seen.has(name)) continue; // de-dupe sub-features within one measure
      seen.add(name);
      links.push({ source: `m:${m.code}`, target: `p:${name}` });
      degree.set(name, (degree.get(name) || 0) + 1);
    }
  }

  const N_M = measures.length;
  const N_P = productMap.size;

  // Place measures in an inner circle, products in an outer ring
  const measureNodes = measures.map((m, i) => ({
    id: `m:${m.code}`,
    kind: 'measure',
    measure: m,
    r: MEASURE_R,
    x: Math.cos((i / N_M) * Math.PI * 2) * 190,
    y: Math.sin((i / N_M) * Math.PI * 2) * 190,
    vx: 0,
    vy: 0,
    pinned: false,
  }));

  const productEntries = [...productMap.entries()];
  const productNodes = productEntries.map(([name, data], i) => ({
    id: `p:${name}`,
    kind: 'product',
    name,
    shortName: shortProductName(name),
    tier: data.tier,
    // Scale radius with degree so main hub products read as the bigger dots.
    r: Math.min(
      PRODUCT_R_MAX,
      PRODUCT_R + ((degree.get(name) || 1) - 1) * PRODUCT_R_PER_DEGREE
    ),
    x: Math.cos((i / N_P) * Math.PI * 2) * 370,
    y: Math.sin((i / N_P) * Math.PI * 2) * 370,
    vx: 0,
    vy: 0,
    pinned: false,
  }));

  const nodeById = new Map([
    ...measureNodes.map((n) => [n.id, n]),
    ...productNodes.map((n) => [n.id, n]),
  ]);

  return { nodes: [...measureNodes, ...productNodes], links, nodeById };
}

// ── Force simulation tick ─────────────────────────────────────────────────

function tick(nodes, links, nodeById, alpha) {
  // Centering gravity
  for (const n of nodes) {
    if (n.pinned) continue;
    n.vx += -n.x * CENTER_K * alpha;
    n.vy += -n.y * CENTER_K * alpha;
  }

  // Charge repulsion — O(n²); n≈117 is perfectly manageable at 60 fps
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    for (let j = i + 1; j < nodes.length; j++) {
      const b = nodes[j];
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      if (dx === 0 && dy === 0) {
        dx = 0.1;
        dy = 0.1;
      }
      const dist2 = dx * dx + dy * dy;
      const dist = Math.sqrt(dist2);
      const strength = (REPULSION * alpha) / dist2;
      const fx = (dx / dist) * strength;
      const fy = (dy / dist) * strength;
      if (!a.pinned) {
        a.vx -= fx;
        a.vy -= fy;
      }
      if (!b.pinned) {
        b.vx += fx;
        b.vy += fy;
      }
    }
  }

  // Spring attraction along edges
  for (const link of links) {
    const a = nodeById.get(link.source);
    const b = nodeById.get(link.target);
    if (!a || !b) continue;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
    const displacement = dist - LINK_DIST;
    const k = displacement * LINK_K * alpha;
    const fx = (dx / dist) * k;
    const fy = (dy / dist) * k;
    if (!a.pinned) {
      a.vx += fx;
      a.vy += fy;
    }
    if (!b.pinned) {
      b.vx -= fx;
      b.vy -= fy;
    }
  }

  // Integrate velocity
  for (const n of nodes) {
    if (n.pinned) continue;
    n.vx *= DAMPING;
    n.vy *= DAMPING;
    n.x += n.vx;
    n.y += n.vy;
  }
}

// ── Component ─────────────────────────────────────────────────────────────

export default function NetworkMapView({
  lang,
  selectedCode,
  onSelect,
  typeFilter,
  tierFilter,
}) {
  // ── State (read during render) ──────────────────────────────────────────
  // Graph is initialized once via lazy useState; its node positions are
  // mutated in-place by the simulation and re-renders are triggered via setTick.
  const [graph] = useState(() => buildGraph());
  const { nodes, links, nodeById } = graph;

  const [transform, setTransformState] = useState({ x: 0, y: 0, scale: 0.55 });
  const [hoveredId, setHoveredId] = useState(null);
  const [tooltip, setTooltip] = useState(null); // { x, y, text }
  const [, setTick] = useState(0); // incremented each sim frame to trigger re-render

  // ── Refs (only accessed in effects/handlers, never during render) ───────
  const svgRef = useRef(null);
  const alphaRef = useRef(1.0);
  const rafRef = useRef(null);
  const startSimRef = useRef(null);
  const dragNodeRef = useRef(null); // node currently being dragged
  const dragStartRef = useRef(null); // { x, y, node } where the pointer went down
  const isDraggingRef = useRef(false); // true once DRAG_THRESHOLD is exceeded
  const isPanningRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  // Mirror of transform state — kept current inside the setState updater so
  // event handlers can read the latest value without stale closures.
  const transformRef = useRef({ x: 0, y: 0, scale: 0.55 });

  // ── Transform helper (syncs state + ref atomically) ─────────────────────
  const setTransform = useCallback((updater) => {
    setTransformState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      transformRef.current = next;
      return next;
    });
  }, []);

  // ── Center the canvas on first mount ────────────────────────────────────
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const { width, height } = svg.getBoundingClientRect();
    if (width > 0 && height > 0) {
      setTransform({ x: width / 2, y: height / 2, scale: 0.55 });
    }
  }, [setTransform]);

  // ── Force simulation loop ────────────────────────────────────────────────
  useEffect(() => {
    function animate() {
      if (alphaRef.current > ALPHA_MIN) {
        tick(nodes, links, nodeById, alphaRef.current);
        alphaRef.current *= ALPHA_DECAY;
        setTick((n) => n + 1);
        rafRef.current = requestAnimationFrame(animate);
      } else {
        rafRef.current = null;
      }
    }

    startSimRef.current = () => {
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    startSimRef.current();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [nodes, links, nodeById, setTick]);

  // ── Event handlers ────────────────────────────────────────────────────

  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const rect = svgRef.current.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      setTransform((t) => ({
        scale: Math.max(0.1, Math.min(6, t.scale * factor)),
        x: mx - (mx - t.x) * factor,
        y: my - (my - t.y) * factor,
      }));
    },
    [setTransform]
  );

  // Pan starts when clicking the SVG background (not a node)
  const handleSvgMouseDown = useCallback((e) => {
    if (e.target === svgRef.current || e.target.classList.contains('nm-backdrop')) {
      isPanningRef.current = true;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    }
  }, []);

  // Potential node drag/click starts here
  const handleNodePointerDown = useCallback((e, node) => {
    e.stopPropagation();
    dragStartRef.current = { x: e.clientX, y: e.clientY, node };
    isDraggingRef.current = false;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };

      // Promote potential drag to confirmed drag once the threshold is crossed
      if (dragStartRef.current && !isDraggingRef.current) {
        const totalDx = e.clientX - dragStartRef.current.x;
        const totalDy = e.clientY - dragStartRef.current.y;
        if (Math.sqrt(totalDx * totalDx + totalDy * totalDy) > DRAG_THRESHOLD) {
          isDraggingRef.current = true;
          const { node } = dragStartRef.current;
          node.pinned = true;
          dragNodeRef.current = node;
          alphaRef.current = Math.max(alphaRef.current, 0.3);
          if (startSimRef.current) startSimRef.current();
        }
      }

      if (dragNodeRef.current) {
        const scale = transformRef.current.scale;
        dragNodeRef.current.x += dx / scale;
        dragNodeRef.current.y += dy / scale;
        dragNodeRef.current.vx = 0;
        dragNodeRef.current.vy = 0;
        setTick((n) => n + 1);
      } else if (isPanningRef.current) {
        setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
      }

      // Keep tooltip pinned to cursor while hovering
      setTooltip((tt) => (tt ? { ...tt, x: e.clientX + 14, y: e.clientY - 8 } : null));
    },
    [setTransform, setTick]
  );

  const handleMouseUp = useCallback(() => {
    if (dragNodeRef.current) {
      // Node drag released — unpin and let the sim settle
      dragNodeRef.current.pinned = false;
      dragNodeRef.current = null;
      alphaRef.current = Math.max(alphaRef.current, 0.1);
      if (startSimRef.current) startSimRef.current();
    } else if (dragStartRef.current && !isDraggingRef.current) {
      // Clean pointer-up with no drag → treat as a click
      const { node } = dragStartRef.current;
      if (node.kind === 'measure') {
        onSelect(node.measure.code === selectedCode ? null : node.measure.code);
      }
    }
    dragStartRef.current = null;
    isDraggingRef.current = false;
    isPanningRef.current = false;
  }, [onSelect, selectedCode]);

  // ── Derived highlight data (computed from state, not from refs) ──────────
  const connectedIds = new Set();
  const connectedLinkIndices = new Set();
  if (hoveredId) {
    links.forEach((link, i) => {
      if (link.source === hoveredId || link.target === hoveredId) {
        connectedIds.add(link.source);
        connectedIds.add(link.target);
        connectedLinkIndices.add(i);
      }
    });
  }
  const hasHover = hoveredId !== null;

  // ── Derived filter data (footer type/tier filters) ──────────────────────
  // A measure passes the filters using the same semantics as the Matrix and
  // Journey views. Products stay visible when linked to a passing measure.
  const hasFilter = Boolean(typeFilter || tierFilter);
  const passId = new Set();
  if (hasFilter) {
    for (const node of nodes) {
      if (node.kind !== 'measure') continue;
      const m = node.measure;
      const passes =
        !(typeFilter && m.type !== typeFilter) &&
        !(tierFilter && highestTier(m) !== tierFilter);
      if (passes) passId.add(node.id);
    }
    for (const link of links) {
      if (passId.has(link.source)) passId.add(link.target);
    }
  }
  const isFilteredOut = (id) => hasFilter && !passId.has(id);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="network-map" role="region" aria-label={t(lang, 'vName_network')}>
      {/* SVG canvas — handles pan (background) and zoom (wheel) */}
      <svg
        ref={svgRef}
        className="network-map__svg"
        onWheel={handleWheel}
        onMouseDown={handleSvgMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Transparent full-canvas background to catch pan events */}
        <rect
          className="nm-backdrop"
          x="-99999"
          y="-99999"
          width="199998"
          height="199998"
          fill="transparent"
        />

        <g
          transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}
        >
          {/* ── Edges ─────────────────────────────── */}
          <g aria-hidden="true">
            {links.map((link, i) => {
              const a = nodeById.get(link.source);
              const b = nodeById.get(link.target);
              if (!a || !b) return null;
              const isHi = connectedLinkIndices.has(i);
              const edgeFilteredOut = isFilteredOut(link.source);
              const edgeOpacity = edgeFilteredOut
                ? 0.03
                : hasHover
                  ? isHi
                    ? 0.7
                    : 0.04
                  : 0.2;
              return (
                <line
                  key={i}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className={`nm-edge${isHi ? ' nm-edge--hi' : ''}`}
                  style={{ opacity: edgeOpacity }}
                />
              );
            })}
          </g>

          {/* ── Nodes ─────────────────────────────── */}
          <g>
            {nodes.map((node) => {
              const isMeasure = node.kind === 'measure';
              const isSelected = isMeasure && node.measure.code === selectedCode;
              const isHovered = node.id === hoveredId;
              const isConnected = connectedIds.has(node.id);
              const filteredOut = isFilteredOut(node.id);
              const dimmed = filteredOut || (hasHover && !isConnected);
              const nodeOpacity = dimmed ? (filteredOut ? 0.06 : 0.12) : 1;

              const circleClass = [
                'nm-circle',
                isMeasure
                  ? `nm-circle--${node.measure.type === 'T' ? 'tech' : 'org'}`
                  : `nm-circle--${node.tier.toLowerCase()}`,
                isSelected ? 'nm-circle--selected' : '',
                isHovered ? 'nm-circle--hovered' : '',
              ]
                .filter(Boolean)
                .join(' ');

              const tooltipText = isMeasure
                ? `${node.measure.code}: ${localized(node.measure, 'title', lang)}`
                : node.name;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x},${node.y})`}
                  className={`nm-node${isMeasure ? ' nm-node--measure' : ' nm-node--product'}`}
                  style={{
                    opacity: nodeOpacity,
                    cursor: isMeasure ? 'pointer' : 'grab',
                  }}
                  onMouseEnter={(e) => {
                    setHoveredId(node.id);
                    setTooltip({
                      x: e.clientX + 14,
                      y: e.clientY - 8,
                      text: tooltipText,
                    });
                  }}
                  onMouseLeave={() => {
                    setHoveredId(null);
                    setTooltip(null);
                  }}
                  onMouseDown={(e) => handleNodePointerDown(e, node)}
                >
                  <circle r={node.r} className={circleClass} />

                  {/* Measure nodes show their code inside the circle */}
                  {isMeasure && (
                    <text
                      className="nm-label nm-label--measure"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      aria-label={tooltipText}
                    >
                      {node.measure.code}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* Tooltip (DOM overlay for correct font rendering) */}
      {tooltip && (
        <div
          className="nm-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
          aria-hidden="true"
        >
          {tooltip.text}
        </div>
      )}

      {/* Drag / zoom hint */}
      <p className="nm-hint" aria-hidden="true">
        {t(lang, 'networkDragHint')}
      </p>

      {/* Legend */}
      <div className="nm-legend" role="list" aria-label={t(lang, 'networkLegend')}>
        <span className="nm-legend__heading" aria-hidden="true">
          {t(lang, 'networkLegend')}
        </span>
        <span className="nm-legend__sep" aria-hidden="true" />

        {/* Measure types */}
        <span className="nm-legend__item" role="listitem">
          <span className="nm-legend__dot nm-legend__dot--org" aria-hidden="true" />
          {t(lang, 'organisational')}
        </span>
        <span className="nm-legend__item" role="listitem">
          <span className="nm-legend__dot nm-legend__dot--tech" aria-hidden="true" />
          {t(lang, 'technical')}
        </span>

        <span className="nm-legend__sep" aria-hidden="true" />

        {/* Product tiers */}
        {['A1', 'A3', 'A5'].map((tier) => (
          <span key={tier} className="nm-legend__item" role="listitem">
            <span
              className={`nm-legend__dot nm-legend__dot--${tier.toLowerCase()}`}
              aria-hidden="true"
            />
            {tier}
          </span>
        ))}
      </div>
    </div>
  );
}
