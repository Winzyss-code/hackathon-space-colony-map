import React, { useState, useRef, useEffect, useMemo } from "react";



function polarToCartesian(cx, cy, radius, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
  return { x: cx + radius * Math.cos(angleRad), y: cy + radius * Math.sin(angleRad) };
}

function describeArc(cx, cy, innerR, outerR, startAngle, endAngle) {
  const startOuter = polarToCartesian(cx, cy, outerR, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerR, startAngle);
  const startInner = polarToCartesian(cx, cy, innerR, endAngle);
  const endInner = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${startOuter.x} ${startOuter.y} A ${outerR} ${outerR} 0 ${largeArcFlag} 0 ${endOuter.x} ${endOuter.y} L ${endInner.x} ${endInner.y} A ${innerR} ${innerR} 0 ${largeArcFlag} 1 ${startInner.x} ${startInner.y} Z`;
}

export default function Map({ size = 1000 }) {
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size * 0.44;
  const innerRadius = size * 0.22;
  const biosphereRadius = size * 0.18;

  const sectors = useMemo(() => [
    { id: 1, name: "Industry", color: "#e8a29c", info: "Manufacturing & processing" },
    { id: 2, name: "Storage", color: "#f4d68a", info: "Material & fuel storage" },
    { id: 3, name: "Housing", color: "#b1dbe6", info: "Residential and services" },
    { id: 4, name: "Waste & Processing", color: "#bce1ac", info: "Recycling & waste-to-energy" },
    { id: 5, name: "R&D / Labs", color: "#ceb8e4", info: "Research, labs, testing" },
    { id: 6, name: "Energy", color: "#f1dfc3", info: "Power generation & storage" },
    { id: 7, name: "Crops / Biosystems", color: "#cde7c5", info: "Greenhouses & farms" }
  ], []);
  const zoomBtn = {
    background: "#fff",
    padding: "8px 12px",
    borderRadius: 6,
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    fontSize: "clamp(12px, 3vw, 14px)",
  };


  const [hover, setHover] = useState(null);
  const [selected, setSelected] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panRef = useRef({ sx: 0, sy: 0, ox: 0, oy: 0 });
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const wheel = (e) => {
      e.preventDefault();
      const dir = -Math.sign(e.deltaY);
      const factor = dir > 0 ? 1.12 : 0.88;
      setZoom((z) => Math.max(0.5, Math.min(3, z * factor)));
    };
    svg.addEventListener("wheel", wheel, { passive: false });
    return () => svg.removeEventListener("wheel", wheel);
  }, []);

  function startPan(e) {
    setIsPanning(true);
    panRef.current.sx = e.clientX;
    panRef.current.sy = e.clientY;
    panRef.current.ox = offset.x;
    panRef.current.oy = offset.y;
  }
  function movePan(e) {
    if (!isPanning) return;
    const dx = e.clientX - panRef.current.sx;
    const dy = e.clientY - panRef.current.sy;
    setOffset({ x: panRef.current.ox + dx, y: panRef.current.oy + dy });
  }
  function endPan() {
    setIsPanning(false);
  }


  function industryFill(cx, cy, r1, r2, start, end) {
    const elems = [];
    const rings = 6;
    const cols = 14;
    const ringStep = (r2 - r1) / rings;
    const angleStep = (end - start) / cols;

    for (let ri = 0; ri < rings; ri++) {
      const rMid = r1 + ri * ringStep + ringStep * 0.5;
      for (let ci = 0; ci < cols; ci++) {
        const angle = start + ci * angleStep + angleStep * 0.5;
        const pos = polarToCartesian(cx, cy, rMid, angle);
        const length = Math.max(12, ringStep * 0.9);
        const width = Math.max(4, (angleStep / 360) * Math.PI * rMid * 0.6);
        const rot = angle + 90;
        const fill = ci % 3 === 0 ? "#6b6b6b" : "#8c8c8c";
        const stroke = "#2b2b2b";
        elems.push(
          <rect key={`ind-${ri}-${ci}`} x={pos.x - length / 2} y={pos.y - width / 2} width={length} height={width} rx={3}
            transform={`rotate(${rot} ${pos.x} ${pos.y})`} fill={fill} stroke={stroke} strokeWidth={0.6} opacity={0.95} />
        );
      }
    }
    return elems;
  }
   function treeFill(cx, cy, r1, r2, start, end) {
    const elems = [];
    const rings = 9;
    const cols = 18;
    const ringStep = (r2 - r1) / rings;
    const angleStep = (end - start) / cols;

    for (let ri = 0; ri < rings; ri++) {
      const rMid = r1 + ri * ringStep + ringStep * 0.5;
      for (let ci = 0; ci < cols; ci++) {
        const angle = start + ci * angleStep + angleStep * 0.5;
        const pos = polarToCartesian(cx, cy, rMid, angle);
        const treeR = Math.max(3, ringStep * 0.3);
        elems.push(
          <g key={`tree-${ri}-${ci}`}>
            <circle cx={pos.x} cy={pos.y} r={treeR} fill="#3c8c4a" stroke="#2b5e33" strokeWidth={0.5} />
            <rect x={pos.x - treeR * 0.1} y={pos.y + treeR * 0.6} width={treeR * 0.2} height={treeR * 0.8} fill="#6b4f2a" />
          </g>
        );
      }
    }
    return elems;
  }

  function storageFill(cx, cy, r1, r2, start, end) {
    const elems = [];
    const rings = 8;
    const cols = 10;
    const ringStep = (r2 - r1) / rings;
    const angleStep = (end - start) / cols;
    const palette = ["#c9b07a", "#d8c48f", "#bfa86a"];

    for (let ri = 0; ri < rings; ri++) {
      const rMid = r1 + ri * ringStep + ringStep * 0.5;
      for (let ci = 0; ci < cols; ci++) {
        const angle = start + ci * angleStep + angleStep * 0.5;
        const pos = polarToCartesian(cx, cy, rMid, angle);
        const w = ringStep * 0.8;
        const h = Math.max(6, (angleStep / 360) * Math.PI * rMid * 0.6);
        const fill = palette[(ri + ci) % palette.length];
        elems.push(
          <rect key={`sto-${ri}-${ci}`} x={pos.x - w/2} y={pos.y - h/2} width={w} height={h} rx={2} fill={fill} stroke="#8b6f3d" strokeWidth={0.5} opacity={0.95} />
        );
      }
    }
    return elems;
  }

  function housingFill(cx, cy, r1, r2, start, end) {
    const elems = [];
    const rings = 7;
    const cols = 16;
    const ringStep = (r2 - r1) / rings;
    const angleStep = (end - start) / cols;
    const roofs = ["#e27b7b", "#f2b97a", "#7fb8e7", "#9ad68f"];

    for (let ri = 0; ri < rings; ri++) {
      const rMid = r1 + ri * ringStep + ringStep * 0.45;
      for (let ci = 0; ci < cols; ci++) {
        const angle = start + ci * angleStep + angleStep * 0.5;
        const pos = polarToCartesian(cx, cy, rMid, angle);
        const houseW = Math.max(6, ringStep * 0.5);
        const houseH = Math.max(6, (angleStep / 360) * Math.PI * rMid * 0.45);
        const roof = roofs[(ri * 3 + ci) % roofs.length];
        elems.push(
          <g key={`hou-${ri}-${ci}`}>
            <rect x={pos.x - houseW/2} y={pos.y - houseH/2} width={houseW} height={houseH} rx={3} fill="#ffffff" stroke="#bdbdbd" strokeWidth={0.6} />
            <rect x={pos.x - houseW/2} y={pos.y - houseH/2} width={houseW} height={houseH*0.4} rx={3} fill={roof} opacity={0.95} />
          </g>
        );
      }
    }
    return elems;
  }

  function wasteFill(cx, cy, r1, r2, start, end) {
    const elems = [];
    const rings = 6;
    const cols = 12;
    const ringStep = (r2 - r1) / rings;
    const angleStep = (end - start) / cols;

    for (let ri = 0; ri < rings; ri++) {
      const rMid = r1 + ri * ringStep + ringStep * 0.55;
      for (let ci = 0; ci < cols; ci++) {
        const angle = start + ci * angleStep + angleStep * 0.5;
        const pos = polarToCartesian(cx, cy, rMid, angle);
        const tankR = Math.max(3, ringStep * 0.28);
        elems.push(
          <circle key={`was-${ri}-${ci}`} cx={pos.x} cy={pos.y} r={tankR} fill="#f2b57f" stroke="#9b5a2a" strokeWidth={0.6} opacity={0.95} />
        );
        elems.push(
          <circle key={`wasv-${ri}-${ci}`} cx={pos.x + tankR*0.6} cy={pos.y - tankR*0.6} r={Math.max(0.8, tankR*0.25)} fill="#6b3a1f" />
        );
      }
    }
    return elems;
  }

  function researchFill(cx, cy, r1, r2, start, end) {
    const elems = [];
    const rings = 5;
    const cols = 10;
    const ringStep = (r2 - r1) / rings;
    const angleStep = (end - start) / cols;

    for (let ri = 0; ri < rings; ri++) {
      const rMid = r1 + ri * ringStep + ringStep * 0.5;
      for (let ci = 0; ci < cols; ci++) {
        const angle = start + ci * angleStep + angleStep * 0.5;
        const pos = polarToCartesian(cx, cy, rMid, angle);
        const nodeSize = Math.max(3, ringStep * 0.22);
        elems.push(
          <rect key={`res-${ri}-${ci}`} x={pos.x - nodeSize} y={pos.y - nodeSize} width={nodeSize*2} height={nodeSize*2} rx={2} fill="#9cc0e8" stroke="#3b6fa6" strokeWidth={0.5} opacity={0.95} />
        );
        if (ci < cols - 1) {
          const angle2 = start + (ci+1) * angleStep + angleStep * 0.5;
          const pos2 = polarToCartesian(cx, cy, rMid, angle2);
          elems.push(<line key={`resl-${ri}-${ci}`} x1={pos.x} y1={pos.y} x2={pos2.x} y2={pos2.y} stroke="#7aa0d6" strokeWidth={0.6} opacity={0.6} />);
        }
      }
    }
    return elems;
  }

  function energyFill(cx, cy, r1, r2, start, end) {
    const elems = [];
    const rings = 6;
    const cols = 12;
    const ringStep = (r2 - r1) / rings;
    const angleStep = (end - start) / cols;

    for (let ri = 0; ri < rings; ri++) {
      const rMid = r1 + ri * ringStep + ringStep * 0.5;
      for (let ci = 0; ci < cols; ci++) {
        const angle = start + ci * angleStep + angleStep * 0.5;
        const pos = polarToCartesian(cx, cy, rMid, angle);
        const panelW = Math.max(6, ringStep * 0.6);
        const panelH = Math.max(3, (angleStep / 360) * Math.PI * rMid * 0.5);
        if ((ri + ci) % 7 === 0) {
          elems.push(<circle key={`erg-${ri}-${ci}`} cx={pos.x} cy={pos.y} r={Math.max(4, ringStep*0.35)} fill="#cfcfcf" stroke="#7d7d7d" strokeWidth={0.6} opacity={0.95} />);
        } else {
          elems.push(<rect key={`erp-${ri}-${ci}`} x={pos.x - panelW/2} y={pos.y - panelH/2} width={panelW} height={panelH} rx={1} fill="#2b3b58" stroke="#1b2738" strokeWidth={0.5} opacity={0.95} />);
        }
      }
    }
    return elems;
  }

  const sectorAngles = useMemo(() => {
    const count = sectors.length;
    const span = 360 / count;
    return sectors.map((s, i) => ({ ...s, start: -90 + i * span, end: -90 + (i + 1) * span }));
  }, [sectors]);

  function onSectorHover(s, e) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setHover({ name: s.name, info: s.info, x: e.clientX - rect.left, y: e.clientY - rect.top });
  }
  function onSectorLeave() {
    setHover(null);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: 24,
        width: "100%",
        maxWidth: "100%",
        padding: 12,
        boxSizing: "border-box",
      }}
    >
      {/* ====== SVG MAP ====== */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "700px",
          flex: "1 1 100%",
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${size} ${size}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: "100%",
            height: "auto",
            borderRadius: 8,
            background: "#fbfbfa",
            touchAction: "none",
            cursor: isPanning ? "grabbing" : "default",
          }}
          onMouseDown={startPan}
          onMouseMove={movePan}
          onMouseUp={endPan}
          onMouseLeave={endPan}
        >
          <g transform={`translate(${offset.x} ${offset.y}) scale(${zoom})`}>
            <circle cx={cx} cy={cy} r={outerRadius + 16} fill="#ffffff" stroke="#e9e9e9" />
            {sectorAngles.map((sec) => (
              <g key={sec.id}>
                <path
                  d={describeArc(cx, cy, innerRadius, outerRadius, sec.start, sec.end)}
                  fill={sec.color}
                  stroke="#333"
                  strokeWidth={1}
                />
                {sec.id === 1 && industryFill(cx, cy, innerRadius + 6, outerRadius - 6, sec.start, sec.end)}
                {sec.id === 2 && storageFill(cx, cy, innerRadius + 6, outerRadius - 6, sec.start, sec.end)}
                {sec.id === 3 && housingFill(cx, cy, innerRadius + 6, outerRadius - 6, sec.start, sec.end)}
                {sec.id === 4 && wasteFill(cx, cy, innerRadius + 6, outerRadius - 6, sec.start, sec.end)}
                {sec.id === 5 && researchFill(cx, cy, innerRadius + 6, outerRadius - 6, sec.start, sec.end)}
                {sec.id === 6 && energyFill(cx, cy, innerRadius + 6, outerRadius - 6, sec.start, sec.end)}
                {sec.id === 7 && treeFill(cx, cy, innerRadius + 6, outerRadius - 6, sec.start, sec.end)}

                <path
                  d={describeArc(cx, cy, innerRadius, outerRadius, sec.start, sec.end)}
                  fill="transparent"
                  onMouseEnter={(e) => onSectorHover(sec, e)}
                  onMouseMove={(e) => onSectorHover(sec, e)}
                  onMouseLeave={onSectorLeave}
                  onClick={() => setSelected(sec)}
                  style={{ cursor: "pointer" }}
                />

                {(() => {
                  const mid = (sec.start + sec.end) / 2;
                  const pos = polarToCartesian(cx, cy, (innerRadius + outerRadius) / 2, mid);
                  return (
                    <text
                      x={pos.x}
                      y={pos.y}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      fontSize={Math.max(10, size * 0.012)}
                      fontWeight={800}
                      fill="#111"
                    >
                      {sec.id}
                    </text>
                  );
                })()}
              </g>
            ))}
            <circle cx={cx} cy={cy} r={biosphereRadius} fill="#eaf4e6" stroke="#2b2b2b" strokeWidth={2} />
            <text x={cx} y={cy + 6} textAnchor="middle" fontSize={Math.max(12, size * 0.02)} fontWeight={900} fill="#111">
              BIOSPHERE
            </text>
          </g>
        </svg>

        {hover && (
          <div
            style={{
              position: "absolute",
              left: hover.x,
              top: hover.y,
              pointerEvents: "none",
              transform: "translate(-50%, -120%)",
            }}
          >
            <div
              style={{
                background: "white",
                border: "1px solid #ddd",
                padding: 8,
                borderRadius: 6,
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                fontSize: "clamp(10px, 2vw, 14px)",
              }}
            >
              <div style={{ fontWeight: 800 }}>{hover.name}</div>
              <div style={{ fontSize: 12, color: "#666" }}>{hover.info}</div>
            </div>
          </div>
        )}
      </div>

      {/* ====== INFO PANELS ====== */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          width: "100%",
          maxWidth: "400px",
          flex: "1 1 100%",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: 12,
            borderRadius: 8,
            boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Legend</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {sectors.map((s) => (
              <div key={s.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 20, height: 12, background: s.color, border: "1px solid #333" }} />
                <div style={{ fontSize: "clamp(10px, 2vw, 13px)" }}>{s.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            padding: 12,
            borderRadius: 8,
            boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Selected Sector</div>
          {selected ? (
            <div>
              <div style={{ fontWeight: 800 }}>{selected.name}</div>
              <div style={{ fontSize: 13, color: "#666", marginTop: 6 }}>{selected.info}</div>
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <button
                  onClick={() => alert(`Navigate to ${selected.name}`)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    fontSize: "clamp(12px, 3vw, 14px)",
                  }}
                >
                  Goto
                </button>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    background: "#f3f4f6",
                    border: "none",
                    borderRadius: 6,
                    fontSize: "clamp(12px, 3vw, 14px)",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div style={{ color: "#777", fontSize: "clamp(12px, 2vw, 14px)" }}>Click any sector to view details.</div>
          )}
        </div>

        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          <button onClick={() => setZoom((z) => Math.min(3, z * 1.2))} style={zoomBtn}>
            +
          </button>
          <button onClick={() => setZoom((z) => Math.max(0.5, z / 1.2))} style={zoomBtn}>
            −
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setOffset({ x: 0, y: 0 });
            }}
            style={zoomBtn}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );


}
