import { AnimatePresence, motion } from "motion/react";

interface ConstellationData {
  name: string;
  stars: [number, number][];
  lineIndices: [number, number][];
}

const CONSTELLATIONS: ConstellationData[] = [
  {
    name: "Orion",
    stars: [
      [120, 80],
      [155, 95],
      [175, 85],
      [195, 90],
      [145, 120],
      [165, 145],
      [148, 170],
    ],
    lineIndices: [
      [0, 1],
      [1, 2],
      [2, 3],
      [1, 4],
      [4, 5],
      [5, 6],
    ],
  },
  {
    name: "Ursa Major",
    stars: [
      [600, 100],
      [640, 88],
      [680, 95],
      [715, 110],
      [730, 140],
      [700, 165],
      [660, 160],
    ],
    lineIndices: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 2],
    ],
  },
  {
    name: "Cassiopeia",
    stars: [
      [300, 60],
      [340, 40],
      [380, 55],
      [415, 35],
      [450, 50],
    ],
    lineIndices: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
  },
  {
    name: "Leo",
    stars: [
      [500, 280],
      [540, 250],
      [580, 260],
      [610, 280],
      [590, 310],
      [545, 310],
      [510, 320],
    ],
    lineIndices: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 0],
    ],
  },
];

function ConstellationSvg() {
  return (
    <svg
      width="100%"
      height="100%"
      style={{ position: "absolute", inset: 0 }}
      aria-hidden="true"
    >
      {CONSTELLATIONS.map((c) => (
        <g key={c.name}>
          {c.lineIndices.map(([a, b]) => (
            <line
              key={`${c.name}-${a}-${b}`}
              x1={c.stars[a][0]}
              y1={c.stars[a][1]}
              x2={c.stars[b][0]}
              y2={c.stars[b][1]}
              stroke="rgba(246,195,91,0.35)"
              strokeWidth="0.8"
            />
          ))}
          {c.stars.map(([x, y], i) => (
            <circle
              key={`${c.name}-s${i}`}
              cx={x}
              cy={y}
              r="2"
              fill="#F6C35B"
              opacity="0.7"
            />
          ))}
          <text
            x={c.stars[0][0]}
            y={c.stars[0][1] - 10}
            fill="#F6C35B"
            fontSize="10"
            fontFamily="'Plus Jakarta Sans', Inter, sans-serif"
            fontWeight="600"
            opacity="0.8"
            letterSpacing="0.1em"
          >
            {c.name.toUpperCase()}
          </text>
        </g>
      ))}
    </svg>
  );
}

interface Props {
  active: boolean;
}

export function ConstellationOverlay({ active }: Props) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="constellation-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <ConstellationSvg />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
