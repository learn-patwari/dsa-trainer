import type {
  ArrayLayer,
  GraphLayer,
  GridLayer,
  Layer,
  ListLayer,
  MapLayer,
  Marker,
  StackLayer,
  Tone,
  VarsLayer,
} from '../../../shared/animations/index.ts';

/**
 * Draws one frame. Elements keep stable keys between frames, so CSS transitions
 * do the animating: pointers slide between cells, heap values glide between
 * slots, tones cross-fade, and new stack or queue items animate in.
 */
export function Scene({ layers }: { layers: Layer[] }) {
  return (
    <div className="anim-scene">
      {layers.map((l, k) => (
        <LayerView key={`${l.kind}-${k}`} layer={l} />
      ))}
    </div>
  );
}

function LayerView({ layer }: { layer: Layer }) {
  switch (layer.kind) {
    case 'array':
      return <ArrayView l={layer} />;
    case 'map':
      return <MapView l={layer} />;
    case 'stack':
    case 'queue':
      return <StackView l={layer} />;
    case 'vars':
      return <VarsView l={layer} />;
    case 'grid':
      return <GridView l={layer} />;
    case 'graph':
      return <GraphView l={layer} />;
    case 'list':
      return <ListView l={layer} />;
  }
}

const tone = (t: Tone | undefined) => `tone-${t ?? 'plain'}`;

/** Several pointers on one cell stack downwards instead of overlapping. */
function stacked(markers: Marker[]): (Marker & { row: number })[] {
  const seen = new Map<number, number>();
  return markers.map((m) => {
    const row = seen.get(m.at) ?? 0;
    seen.set(m.at, row + 1);
    return { ...m, row };
  });
}

function ArrayView({ l }: { l: ArrayLayer }) {
  const markers = stacked(l.markers ?? []);
  const rows = markers.reduce((n, m) => Math.max(n, m.row + 1), 0);
  return (
    <div className="anim-block kind-array">
      {l.label && <div className="anim-label">{l.label}</div>}
      <div className="anim-track" style={{ ['--n' as string]: Math.max(1, l.cells.length) }}>
        {(l.spans ?? []).map((s, k) => (
          <div key={`span-${k}`} className={`anim-span ${tone(s.tone)}`} style={{ ['--from' as string]: s.from, ['--len' as string]: s.to - s.from + 1 }}>
            {s.label && <span>{s.label}</span>}
          </div>
        ))}
        <div className="anim-cells">
          {l.cells.length === 0 && <div className="anim-empty">empty</div>}
          {l.cells.map((c, i) => (
            <div key={c.id ?? i} className={`anim-cell ${tone(c.tone)}`}>
              <span className="anim-v">{c.v}</span>
              {(c.sub ?? (l.indices ? String(i) : undefined)) !== undefined && <span className="anim-sub">{c.sub ?? i}</span>}
            </div>
          ))}
        </div>
        {markers.length > 0 && (
          <div className="anim-markers" style={{ ['--rows' as string]: rows }}>
            {markers.map((m) => (
              <div key={m.label} className={`anim-marker ${tone(m.tone ?? 'active')}`} style={{ ['--at' as string]: m.at, ['--row' as string]: m.row }}>
                <span className="anim-caret" aria-hidden>
                  ▲
                </span>
                {m.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MapView({ l }: { l: MapLayer }) {
  return (
    <div className="anim-block kind-map">
      <div className="anim-label">{l.label}</div>
      <div className="anim-map">
        {l.entries.length === 0 && <div className="anim-empty">{l.empty ?? 'empty'}</div>}
        {l.entries.map((e) => (
          <div key={e.k} className={`anim-entry anim-enter ${tone(e.tone)}`}>
            <span className="mono">{e.k}</span>
            <span className="anim-arrow">→</span>
            <span className="mono">{e.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StackView({ l }: { l: StackLayer }) {
  return (
    <div className="anim-block kind-stack">
      <div className="anim-label">{l.label}</div>
      <div className={l.kind === 'stack' ? 'anim-stack' : 'anim-queue'}>
        {l.items.length === 0 && <div className="anim-empty">{l.empty ?? 'empty'}</div>}
        {l.items.map((c, i) => (
          <div key={c.id ?? `${i}-${c.v}`} className={`anim-item anim-enter ${tone(c.tone)}`}>
            <span className="anim-v">{c.v}</span>
            {c.sub && <span className="anim-sub">{c.sub}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function VarsView({ l }: { l: VarsLayer }) {
  return (
    <div className="anim-vars">
      {l.items.map((v) => (
        <span key={v.k} className={`anim-var ${tone(v.tone)}`}>
          <span className="muted">{v.k}</span> = <strong className="mono">{v.v}</strong>
        </span>
      ))}
    </div>
  );
}

function GridView({ l }: { l: GridLayer }) {
  const cols = l.rows[0]?.length ?? 0;
  return (
    <div className="anim-block kind-grid">
      {l.label && <div className="anim-label">{l.label}</div>}
      <div className="anim-grid" style={{ gridTemplateColumns: `repeat(${cols}, var(--cell))` }}>
        {l.rows.flatMap((row, r) =>
          row.map((c, k) => (
            <div key={`${r}-${k}`} className={`anim-cell ${tone(c.tone)}`}>
              <span className="anim-v">{c.v}</span>
            </div>
          )),
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- SVG layers

const W = 400;

function GraphView({ l }: { l: GraphLayer }) {
  const H = l.height ?? 130;
  const R = 15;
  const px = (x: number) => 22 + (x / 100) * (W - 44);
  const py = (y: number) => 20 + (y / 100) * (H - 40);
  const byId = new Map(l.nodes.map((n) => [n.id, n]));

  return (
    <div className="anim-block kind-graph">
      {l.label && <div className="anim-label">{l.label}</div>}
      <svg className="anim-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={l.label ?? 'graph'}>
        <defs>
          <marker id="anim-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" className="anim-arrowhead" />
          </marker>
        </defs>
        {l.edges.map((e) => {
          const a = byId.get(e.from);
          const b = byId.get(e.to);
          if (!a || !b) return null;
          const [x1, y1, x2, y2] = [px(a.x), py(a.y), px(b.x), py(b.y)];
          const len = Math.hypot(x2 - x1, y2 - y1) || 1;
          const [ux, uy] = [(x2 - x1) / len, (y2 - y1) / len];
          const end = e.directed ? R + 3 : R;
          const hidden = e.tone === 'hidden' || a.tone === 'hidden' || b.tone === 'hidden';
          return (
            <g key={`${e.from}>${e.to}`} className={`anim-edge ${tone(e.tone)} ${hidden ? 'is-hidden' : ''}`}>
              <line x1={x1 + ux * R} y1={y1 + uy * R} x2={x2 - ux * end} y2={y2 - uy * end} markerEnd={e.directed ? 'url(#anim-arrow)' : undefined} />
              {e.label && (
                // Off to one side of the line, so neither the line nor a node sits on it.
                <text x={(x1 + x2) / 2 - uy * 10} y={(y1 + y2) / 2 + ux * 10} dy="0.35em" className="anim-edge-label">
                  {e.label}
                </text>
              )}
            </g>
          );
        })}
        {l.nodes.map((n) => (
          <g key={n.id} className={`anim-node ${tone(n.tone)}`} style={{ transform: `translate(${px(n.x)}px, ${py(n.y)}px)` }}>
            <circle r={R} />
            <text className="anim-node-v" dy="0.35em" style={String(n.v).length > 3 ? { fontSize: 8.5 } : undefined}>
              {n.v}
            </text>
            {n.sub && (
              <text className="anim-node-sub" y={R + 12}>
                {n.sub}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

function ListView({ l }: { l: ListLayer }) {
  const n = l.nodes.length;
  const BW = 42;
  const BH = 32;
  const GAP = 30;
  const width = 24 + n * (BW + GAP);
  const H = 132;
  const top = 34;
  const x = (i: number) => 12 + i * (BW + GAP);
  const markers = stacked(l.markers ?? []);

  return (
    <div className="anim-block kind-list">
      {l.label && <div className="anim-label">{l.label}</div>}
      <svg className="anim-svg" viewBox={`0 0 ${width} ${H}`} role="img" aria-label={l.label ?? 'linked list'}>
        <defs>
          <marker id="anim-arrow-list" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" className="anim-arrowhead" />
          </marker>
        </defs>
        {l.next.map((to, i) => {
          if (to == null) {
            return (
              <text key={`null-${i}`} x={x(i) + BW - 2} y={top - 6} className="anim-null">
                ∅
              </text>
            );
          }
          const mid = top + BH / 2;
          if (to === i + 1) return <line key={`e${i}`} className="anim-link" x1={x(i) + BW} y1={mid} x2={x(to) - 3} y2={mid} markerEnd="url(#anim-arrow-list)" />;
          if (to === i - 1) return <line key={`e${i}`} className="anim-link is-back" x1={x(i)} y1={mid} x2={x(to) + BW + 3} y2={mid} markerEnd="url(#anim-arrow-list)" />;
          // Anything else loops underneath: a cycle, or a jump.
          const x1 = x(i) + BW / 2;
          const x2 = x(to) + BW / 2;
          const yb = top + BH;
          return <path key={`e${i}`} className="anim-link is-loop" d={`M ${x1} ${yb} C ${x1} ${H - 6}, ${x2} ${H - 6}, ${x2} ${yb + 4}`} markerEnd="url(#anim-arrow-list)" fill="none" />;
        })}
        {l.nodes.map((c, i) => (
          <g key={c.id ?? i} className={`anim-lnode ${tone(c.tone)}`}>
            <rect x={x(i)} y={top} width={BW} height={BH} rx={7} />
            <text x={x(i) + BW / 2} y={top + BH / 2} dy="0.35em" className="anim-node-v">
              {c.v}
            </text>
          </g>
        ))}
        {markers.map((m) => (
          <g key={m.label} className={`anim-lmarker ${tone(m.tone ?? 'active')}`} style={{ transform: `translate(${x(m.at) + BW / 2}px, ${top - 12 - m.row * 13}px)` }}>
            <text className="anim-lmarker-t">{m.label} ▾</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
