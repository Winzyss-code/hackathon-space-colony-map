import React, { useState, useRef, useEffect } from "react";

// --- Data from first code ---
const sectors = [
  { id: "INDUSTRY", color: "#f2a2a2", start: 200, end: 250, info: "Manufacturing and maintenance facilities." },
  { id: "STORAGE", color: "#d4e6a5", start: 250, end: 300, info: "Material and supply storage zones." },
  { id: "HOUSING", color: "#a5d5de", start: 300, end: 350, info: "Residential housing for colonists." },
  { id: "WASTE", color: "#d7a5d5", start: 350, end: 400, info: "Waste management and recycling." },
  { id: "CROPS", color: "#b8dbab", start: 400, end: 470, info: "Hydroponic and soil-based crop growth areas." },
  { id: "ENERGY", color: "#f5d48a", start: 470, end: 530, info: "Power generation and storage units." },
];

// --- Helpers from first code ---
const polarToCartesian = (r, angle) => {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: 250 + r * Math.cos(rad), y: 250 + r * Math.sin(rad) };
};

const makeArc = (r1, r2, startAngle, endAngle) => {
  const startOuter = polarToCartesian(r2, startAngle);
  const endOuter = polarToCartesian(r2, endAngle);
  const startInner = polarToCartesian(r1, endAngle);
  const endInner = polarToCartesian(r1, startAngle);

  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `
    M ${startOuter.x} ${startOuter.y}
    A ${r2} ${r2} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}
    L ${startInner.x} ${startInner.y}
    A ${r1} ${r1} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}
    Z
  `;
};

// --- Main fused component ---
export default function SpaceColonyFusion() {
  const [hover, setHover] = useState(null);
  const [selected, setSelected] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panRef = useRef({ startX: 0, startY: 0, ox: 0, oy: 0 });
  const svgreff = useRef(null);

  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey) return;
      e.preventDefault();
      const delta = -e.deltaY;
      const factor = delta > 0 ? 1.1 : 0.9;
      setZoom((z) => Math.max(0.5, Math.min(3, z * factor)));
    };
    const svg = svgreff.current;
    if (svg) svg.addEventListener("wheel", handleWheel, { passive: false });
    return () => svg && svg.removeEventListener("wheel", handleWheel);
  }, []);

  function onMouseDown(e) {
    setIsPanning(true);
    panRef.current.startX = e.clientX;
    panRef.current.startY = e.clientY;
    panRef.current.ox = offset.x;
    panRef.current.oy = offset.y;
  }
  function onMouseMove(e) {
    if (!isPanning) return;
    const dx = e.clientX - panRef.current.startX;
    const dy = e.clientY - panRef.current.startY;
    setOffset({ x: panRef.current.ox + dx, y: panRef.current.oy + dy });
  }
  function onMouseUp() {
    setIsPanning(false);
  }

  function handleHover(sec, event) {
    const rect = svgreff.current.getBoundingClientRect();
    setHover({ ...sec, screenX: event.clientX - rect.left, screenY: event.clientY - rect.top });
  }

  return (
    <div className="min-h-screen bg-[#f8f6ef] flex flex-col items-center p-6">
      <h1 className="text-2xl font-semibold mb-2 text-center">ENERGY AND WASTE MANAGEMENT</h1>
      <p className="text-sm text-gray-600 mb-4 text-center">ROTATION ⟳</p>

      <div className="flex gap-6 w-full max-w-6xl">
        {/* Map area */}
        <div className="flex-1 bg-white rounded-xl shadow p-3 relative">
          <div
            className="border rounded-lg overflow-hidden relative"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            <svg ref={svgreff} width="500" height="500" viewBox="0 0 500 500" className="w-full h-[70vh] touch-none">
              <g transform={`translate(${offset.x}, ${offset.y}) scale(${zoom})`}>
                {/* Outer circle */}
                <circle cx="250" cy="250" r="200" fill="none" stroke="#444" strokeWidth="2" />

                {/* Sector Arcs */}
                {sectors.map((s, i) => (
                  <path
                    key={i}
                    d={makeArc(110, 200, s.start, s.end)}
                    fill={s.color}
                    stroke="#333"
                    strokeWidth="1"
                    className="transition-all hover:scale-105 hover:brightness-105 origin-center cursor-pointer"
                    onMouseEnter={(e) => handleHover(s, e)}
                    onMouseMove={(e) => handleHover(s, e)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => setSelected(s)}
                  />
                ))}

                {/* Inner biosphere */}
                <circle cx="250" cy="250" r="110" fill="#dbe7d0" stroke="#333" />
                <text x="250" y="255" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#222">
                  BIOSPHERE
                </text>

                {/* Inner crops ring */}
                <circle cx="250" cy="250" r="60" fill="#cfe8c7" stroke="#444" />

                {/* Sector labels */}
                {sectors.map((s, i) => {
                  const mid = (s.start + s.end) / 2;
                  const { x, y } = polarToCartesian(155, mid);
                  return (
                    <text
                      key={i}
                      x={x}
                      y={y}
                      fontSize="14"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      fontWeight="600"
                      fill="#333"
                    >
                      {i + 1}
                    </text>
                  );
                })}
              </g>
            </svg>

            {/* Hover Tooltip */}
            {hover && (
              <div
                className="absolute pointer-events-none bg-white shadow rounded-md text-sm p-2 border"
                style={{ left: hover.screenX + 10, top: hover.screenY + 10 }}
              >
                <div className="font-semibold">{hover.id}</div>
                <div className="text-xs mt-1 text-gray-600">{hover.info}</div>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="absolute right-3 bottom-3 flex flex-col gap-2">
              <button className="bg-white p-2 rounded shadow text-sm" onClick={() => setZoom((z) => Math.min(3, z * 1.2))}>
                +
              </button>
              <button className="bg-white p-2 rounded shadow text-sm" onClick={() => setZoom((z) => Math.max(0.5, z / 1.2))}>
                -
              </button>
              <button
                className="bg-white p-2 rounded shadow text-sm"
                onClick={() => {
                  setZoom(1);
                  setOffset({ x: 0, y: 0 });
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-72 bg-white rounded-xl shadow p-4 flex flex-col gap-3">
          <h2 className="font-semibold">Legend</h2>
          <div className="grid grid-cols-1 gap-2">
            {sectors.map((s) => (
              <div className="flex items-center gap-2" key={s.id}>
                <div style={{ width: 26, height: 18, background: s.color, border: "1px solid #333" }} />
                <div className="text-sm">{s.id}</div>
              </div>
            ))}
          </div>

          <div className="mt-3">
            <h3 className="font-semibold">Selected Sector</h3>
            {selected ? (
              <div className="text-sm mt-1">
                <div className="font-medium">{selected.id}</div>
                <div className="text-xs mt-1 text-gray-600">{selected.info}</div>
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 bg-indigo-500 text-white py-1 rounded" onClick={() => alert(`Goto ${selected.id}`)}>
                    Goto
                  </button>
                  <button className="flex-1 bg-gray-100 py-1 rounded" onClick={() => setSelected(null)}>
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Click any sector to view details.</div>
            )}
          </div>

          <div className="mt-auto text-xs text-gray-400">Pan: drag map • Zoom: scroll • Hover for info</div>
        </div>
      </div>

      <p className="text-sm mt-3 text-gray-500 tracking-widest">CROPS</p>
      <h2 className="text-xl font-bold text-gray-800 mt-2 text-center">FUNCTIONAL ANALYSIS OF SPACE COLONY</h2>
    </div>
  );
}
