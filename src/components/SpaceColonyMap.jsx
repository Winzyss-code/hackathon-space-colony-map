import React from "react";

const sectors = [
  { id: "INDUSTRY", color: "#f2a2a2", start: 200, end: 250 },
  { id: "STORAGE", color: "#d4e6a5", start: 250, end: 300 },
  { id: "HOUSING", color: "#a5d5de", start: 300, end: 350 },
  { id: "WASTE", color: "#d7a5d5", start: 350, end: 400 },
  { id: "CROPS", color: "#b8dbab", start: 400, end: 470 },
  { id: "ENERGY", color: "#f5d48a", start: 470, end: 530 },
];

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

const SpaceColonyMap = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-[#f8f6ef] p-10 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
        ENERGY AND WASTE MANAGEMENT
      </h1>
      <p className="text-sm text-gray-500 mb-8 text-center">ROTATION ⟳</p>

      <svg width="500" height="500" viewBox="0 0 500 500">
        {/* Outer circle */}
        <circle
          cx="250"
          cy="250"
          r="200"
          fill="none"
          stroke="#444"
          strokeWidth="2"
        />

        {/* Sectors */}
        {sectors.map((s, i) => (
          <path
            key={i}
            d={makeArc(110, 200, s.start, s.end)}
            fill={s.color}
            stroke="#333"
            strokeWidth="1"
            className="transition-all hover:scale-105 hover:brightness-105 origin-center"
          />
        ))}

        {/* Inner biosphere */}
        <circle cx="250" cy="250" r="110" fill="#dbe7d0" stroke="#333" />
        <text
          x="250"
          y="255"
          textAnchor="middle"
          fontSize="20"
          fontWeight="bold"
          fill="#222"
        >
          BIOSPHERE
        </text>

        {/* Inner ring (crops section) */}
        <circle cx="250" cy="250" r="60" fill="#cfe8c7" stroke="#444" />

        {/* Text labels per sector */}
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
      </svg>

      {/* Bottom labels */}
      <p className="text-sm mt-3 text-gray-500 tracking-widest">CROPS</p>
      <h2 className="text-xl font-bold text-gray-800 mt-2 text-center">
        FUNCTIONAL ANALYSIS OF SPACE COLONY
      </h2>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-gray-700">
        {sectors.map((s) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className="w-4 h-4 border border-gray-700 rounded-sm"
              style={{ backgroundColor: s.color }}
            />
            <span>{s.id}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpaceColonyMap;
