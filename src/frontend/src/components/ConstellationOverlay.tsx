import { AnimatePresence, motion } from "motion/react";

interface ConstellationData {
  name: string;
  stars: [string, string][]; // [xPct, yPct] as percentage strings
  lineIndices: [number, number][];
}

const CONSTELLATIONS: ConstellationData[] = [
  {
    name: "Orion",
    stars: [
      ["8.33%", "8.89%"],
      ["10.76%", "10.56%"],
      ["12.15%", "9.44%"],
      ["13.54%", "10.0%"],
      ["10.07%", "13.33%"],
      ["11.46%", "16.11%"],
      ["10.28%", "18.89%"],
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
      ["41.67%", "11.11%"],
      ["44.44%", "9.78%"],
      ["47.22%", "10.56%"],
      ["49.65%", "12.22%"],
      ["50.69%", "15.56%"],
      ["48.61%", "18.33%"],
      ["45.83%", "17.78%"],
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
      ["20.83%", "6.67%"],
      ["23.61%", "4.44%"],
      ["26.39%", "6.11%"],
      ["28.82%", "3.89%"],
      ["31.25%", "5.56%"],
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
      ["34.72%", "31.11%"],
      ["37.5%", "27.78%"],
      ["40.28%", "28.89%"],
      ["42.36%", "31.11%"],
      ["40.97%", "34.44%"],
      ["37.85%", "34.44%"],
      ["35.42%", "35.56%"],
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
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
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
              strokeWidth="0.2"
            />
          ))}
          {c.stars.map(([x, y], i) => (
            <circle
              key={`${c.name}-s${i}`}
              cx={x}
              cy={y}
              r="0.5"
              fill="#F6C35B"
              opacity="0.7"
            />
          ))}
          <text
            x={c.stars[0][0]}
            y={`calc(${c.stars[0][1]} - 1.2%)`}
            fill="#F6C35B"
            fontSize="1.2"
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
