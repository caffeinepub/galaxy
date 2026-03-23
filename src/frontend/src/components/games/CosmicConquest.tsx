import { AnimatePresence, motion } from "motion/react";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface CosmicConquestProps {
  onGameOver: (score: number) => void;
  actor: any;
  isLoggedIn: boolean;
}

const PLANET_NAMES = [
  "Mercury",
  "Venus",
  "Earth",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
  "Kepler-22b",
  "Proxima Centauri b",
  "TRAPPIST-1e",
  "HD 40307g",
  "Gliese 667Cc",
  "55 Cancri e",
  "Tau Ceti e",
  "Kapteyn b",
  "Wolf 1061c",
  "GJ 667Cc",
  "Luyten b",
];

const TRIVIA: Array<{ q: string; a: string; choices: string[] }> = [
  {
    q: "What is the largest planet in our solar system?",
    a: "Jupiter",
    choices: ["Saturn", "Jupiter", "Uranus", "Neptune"],
  },
  {
    q: "How many moons does Mars have?",
    a: "2",
    choices: ["0", "1", "2", "4"],
  },
  {
    q: "Which planet has the Great Red Spot?",
    a: "Jupiter",
    choices: ["Mars", "Saturn", "Jupiter", "Neptune"],
  },
  {
    q: "What is the hottest planet in our solar system?",
    a: "Venus",
    choices: ["Mercury", "Venus", "Mars", "Jupiter"],
  },
  {
    q: "How long does light from the Sun take to reach Earth?",
    a: "8 minutes",
    choices: ["2 minutes", "8 minutes", "20 minutes", "1 hour"],
  },
  {
    q: "Which planet has rings made mostly of ice?",
    a: "Saturn",
    choices: ["Jupiter", "Uranus", "Saturn", "Neptune"],
  },
  {
    q: "What is a light-year?",
    a: "Distance light travels in one year",
    choices: [
      "Time for light to circle Earth",
      "Distance light travels in one year",
      "Speed of light",
      "One million km",
    ],
  },
  {
    q: "How many planets are in our solar system?",
    a: "8",
    choices: ["7", "8", "9", "10"],
  },
];

type Challenge = { type: "click" | "trivia" | "resource" };
type Planet = { name: string; owner: string | null; claimed: boolean };

function truncatePrincipal(p: string): string {
  if (!p || p.length < 10) return p;
  return `${p.slice(0, 5)}...${p.slice(-4)}`;
}

function randomChallenge(): Challenge {
  const types: Array<"click" | "trivia" | "resource"> = [
    "click",
    "trivia",
    "resource",
  ];
  return { type: types[Math.floor(Math.random() * types.length)] };
}

// ---- Click Challenge ----
function ClickChallenge({
  onSuccess,
  onFail,
}: { onSuccess: () => void; onFail: () => void }) {
  const [clicked, setClicked] = useState(0);
  const [targets, setTargets] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);
  const [timeLeft, setTimeLeft] = useState(5);
  const needed = 10;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const spawn = () => {
      setTargets((prev) => [
        ...prev.slice(-4),
        {
          id: Date.now(),
          x: 10 + Math.random() * 80,
          y: 10 + Math.random() * 70,
        },
      ]);
    };
    spawn();
    const iv = setInterval(spawn, 600);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(iv);
          clearInterval(timerRef.current!);
          onFail();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      clearInterval(iv);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onFail]);

  const handleClick = (id: number) => {
    setTargets((prev) => prev.filter((t) => t.id !== id));
    const newClicked = clicked + 1;
    setClicked(newClicked);
    if (newClicked >= needed) {
      if (timerRef.current) clearInterval(timerRef.current);
      onSuccess();
    }
  };

  return (
    <div>
      <div style={{ color: "#FFD700", fontSize: 13, marginBottom: 8 }}>
        CLICK {needed - clicked} MORE TARGETS in {timeLeft}s
      </div>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 120,
          background: "rgba(0,0,20,0.8)",
          borderRadius: 8,
          border: "1px solid #FFFFFF22",
          overflow: "hidden",
        }}
      >
        {targets.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => handleClick(t.id)}
            style={{
              position: "absolute",
              left: `${t.x}%`,
              top: `${t.y}%`,
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "radial-gradient(circle, #FF8800, #FF4400)",
              border: "2px solid #FFD700",
              cursor: "pointer",
              transform: "translate(-50%,-50%)",
              boxShadow: "0 0 10px #FF880088",
            }}
          >
            🎯
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- Trivia Challenge ----
function TriviaChallenge({
  onSuccess,
  onFail,
}: { onSuccess: () => void; onFail: () => void }) {
  const [q] = useState(() => TRIVIA[Math.floor(Math.random() * TRIVIA.length)]);
  const [selected, setSelected] = useState<string | null>(null);

  const handleAnswer = (choice: string) => {
    setSelected(choice);
    setTimeout(() => {
      choice === q.a ? onSuccess() : onFail();
    }, 600);
  };

  return (
    <div>
      <div
        style={{
          color: "#00FFC8",
          fontSize: 14,
          marginBottom: 12,
          fontWeight: 700,
        }}
      >
        {q.q}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {q.choices.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => handleAnswer(c)}
            disabled={!!selected}
            style={{
              padding: "10px",
              borderRadius: 8,
              fontSize: 12,
              cursor: "pointer",
              border:
                selected === c
                  ? c === q.a
                    ? "2px solid #00FF88"
                    : "2px solid #FF4466"
                  : "1px solid #FFFFFF33",
              background:
                selected === c
                  ? c === q.a
                    ? "rgba(0,255,136,0.2)"
                    : "rgba(255,68,102,0.2)"
                  : "rgba(0,0,40,0.8)",
              color:
                selected === c
                  ? c === q.a
                    ? "#00FF88"
                    : "#FF4466"
                  : "#AABBCC",
            }}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- Resource Challenge ----
function ResourceChallenge({
  onSuccess,
  onFail,
}: { onSuccess: () => void; onFail: () => void }) {
  const [collected, setCollected] = useState(0);
  const [items, setItems] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);
  const [timeLeft, setTimeLeft] = useState(3);
  const needed = 5;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const spawn = () =>
      setItems((prev) => [
        ...prev.slice(-6),
        {
          id: Date.now() + Math.random(),
          x: 5 + Math.random() * 85,
          y: Math.random() * 70 + 5,
        },
      ]);
    spawn();
    spawn();
    spawn();
    const iv = setInterval(spawn, 400);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(iv);
          clearInterval(timerRef.current!);
          onFail();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      clearInterval(iv);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onFail]);

  const handleCollect = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    const n = collected + 1;
    setCollected(n);
    if (n >= needed) {
      if (timerRef.current) clearInterval(timerRef.current);
      onSuccess();
    }
  };

  return (
    <div>
      <div style={{ color: "#FFD700", fontSize: 13, marginBottom: 8 }}>
        COLLECT {needed - collected} MORE in {timeLeft}s
      </div>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 100,
          background: "rgba(0,0,20,0.8)",
          borderRadius: 8,
          border: "1px solid #FFFFFF22",
          overflow: "hidden",
        }}
      >
        {items.map((i) => (
          <button
            key={i.id}
            type="button"
            onClick={() => handleCollect(i.id)}
            style={{
              position: "absolute",
              left: `${i.x}%`,
              top: `${i.y}%`,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "rgba(255,200,0,0.8)",
              border: "none",
              cursor: "pointer",
              transform: "translate(-50%,-50%)",
              fontSize: 14,
            }}
          >
            ⚡
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CosmicConquest({
  onGameOver,
  actor,
  isLoggedIn,
}: CosmicConquestProps) {
  const [planets, setPlanets] = useState<Planet[]>(() =>
    PLANET_NAMES.map((name) => ({ name, owner: null, claimed: false })),
  );
  const [leaderboard, setLeaderboard] = useState<
    Array<{ principal: string; planets: number }>
  >([]);
  const [weeklyWinner, setWeeklyWinner] = useState<string | null>(null);
  const [challengePlanet, setChallengePlanet] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [sessionClaims, setSessionClaims] = useState(0);
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const gameOverCalled = useRef(false);

  // Load data
  useEffect(() => {
    if (!actor) return;
    const load = async () => {
      try {
        const [planetsData, lbData, winnerData] = await Promise.all([
          actor.getAllPlanets() as Promise<
            Array<{ planetName: string; owner: { toString(): string } }>
          >,
          actor.getConquestLeaderboard() as Promise<
            Array<{ principal: { toString(): string }; planetsOwned: bigint }>
          >,
          actor.getWeeklyConquestWinner() as Promise<{ toString(): string }>,
        ]);
        setPlanets(
          PLANET_NAMES.map((name) => {
            const found = planetsData.find((p) => p.planetName === name);
            return {
              name,
              owner: found ? found.owner.toString() : null,
              claimed: !!found,
            };
          }),
        );
        setLeaderboard(
          lbData.map((e) => ({
            principal: e.principal.toString(),
            planets: Number(e.planetsOwned),
          })),
        );
        if (winnerData) setWeeklyWinner(winnerData.toString());
      } catch {
        /* offline mode */
      }
    };
    load();
  }, [actor]);

  const openChallenge = (planetName: string) => {
    if (!isLoggedIn) {
      setFeedback({ msg: "Login to claim planets!", ok: false });
      return;
    }
    setChallengePlanet(planetName);
    setChallenge(randomChallenge());
  };

  const handleChallengeSuccess = useCallback(async () => {
    if (!challengePlanet || !actor) return;
    setLoading(true);
    try {
      await actor.claimPlanet(challengePlanet);
      setPlanets((prev) =>
        prev.map((p) =>
          p.name === challengePlanet
            ? { ...p, owner: "You", claimed: true }
            : p,
        ),
      );
      const newClaims = sessionClaims + 1;
      setSessionClaims(newClaims);
      setFeedback({ msg: `🌍 ${challengePlanet} claimed! +200 pts`, ok: true });
      setChallengePlanet(null);
      setChallenge(null);
    } catch {
      setFeedback({ msg: "Claim failed — try again", ok: false });
    }
    setLoading(false);
    setTimeout(() => setFeedback(null), 2500);
  }, [challengePlanet, actor, sessionClaims]);

  const handleChallengeFail = useCallback(() => {
    setFeedback({ msg: "Challenge failed! Try another planet.", ok: false });
    setChallengePlanet(null);
    setChallenge(null);
    setTimeout(() => setFeedback(null), 2000);
  }, []);

  const handleEndSession = () => {
    if (gameOverCalled.current) return;
    gameOverCalled.current = true;
    onGameOver(sessionClaims * 200);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        fontFamily: "monospace",
        width: "100%",
        maxWidth: 860,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          <div style={{ color: "#FFC800", fontSize: 18, fontWeight: 900 }}>
            🌍 COSMIC CONQUEST
          </div>
          {weeklyWinner && (
            <div style={{ color: "#AABBCC", fontSize: 11 }}>
              Weekly leader: {truncatePrincipal(weeklyWinner)}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div
            style={{
              background: "rgba(255,200,0,0.1)",
              border: "1px solid #FFC80044",
              borderRadius: 8,
              padding: "4px 12px",
              color: "#FFC800",
              fontSize: 13,
            }}
          >
            Claims: {sessionClaims}
          </div>
          <button
            type="button"
            data-ocid="conquest.primary_button"
            onClick={handleEndSession}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid #FFC80088",
              background: "rgba(255,200,0,0.15)",
              color: "#FFC800",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            End Session
          </button>
        </div>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              textAlign: "center",
              fontSize: 13,
              fontWeight: 700,
              background: feedback.ok
                ? "rgba(0,255,136,0.15)"
                : "rgba(255,68,102,0.15)",
              border: `1px solid ${feedback.ok ? "#00FF88" : "#FF4466"}55`,
              color: feedback.ok ? "#00FF88" : "#FF4466",
            }}
          >
            {feedback.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        {/* Planet grid */}
        <div style={{ flex: 2, minWidth: 280 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
              gap: 8,
            }}
          >
            {planets.map((planet, idx) => (
              <motion.div
                key={planet.name}
                data-ocid={`conquest.item.${idx + 1}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.02 }}
                style={{
                  background:
                    planet.owner === "You"
                      ? "rgba(255,200,0,0.15)"
                      : planet.claimed
                        ? "rgba(255,68,102,0.1)"
                        : "rgba(0,0,30,0.8)",
                  border: `1px solid ${planet.owner === "You" ? "#FFC80055" : planet.claimed ? "#FF446655" : "#FFFFFF11"}`,
                  borderRadius: 10,
                  padding: "10px 8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  alignItems: "center",
                  boxShadow:
                    planet.owner === "You" ? "0 0 12px #FFC80033" : "none",
                }}
              >
                <div style={{ fontSize: 22 }}>
                  {planet.owner === "You" ? "🌍" : planet.claimed ? "🔴" : "⚫"}
                </div>
                <div
                  style={{
                    color:
                      planet.owner === "You"
                        ? "#FFC800"
                        : planet.claimed
                          ? "#FF8888"
                          : "#AABBCC",
                    fontSize: 11,
                    fontWeight: 700,
                    textAlign: "center",
                  }}
                >
                  {planet.name}
                </div>
                <div
                  style={{
                    color: "#556677",
                    fontSize: 10,
                    textAlign: "center",
                  }}
                >
                  {planet.owner === "You"
                    ? "Yours!"
                    : planet.owner
                      ? truncatePrincipal(planet.owner)
                      : "Unclaimed"}
                </div>
                <button
                  type="button"
                  data-ocid={`conquest.claim_button.${idx + 1}`}
                  onClick={() => openChallenge(planet.name)}
                  disabled={planet.owner === "You" || loading}
                  style={{
                    width: "100%",
                    padding: "6px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: planet.owner === "You" ? "default" : "pointer",
                    border: "1px solid #FFC80066",
                    background:
                      planet.owner === "You"
                        ? "rgba(255,200,0,0.1)"
                        : "rgba(255,200,0,0.15)",
                    color: planet.owner === "You" ? "#665500" : "#FFC800",
                    opacity: planet.owner === "You" ? 0.5 : 1,
                  }}
                >
                  {planet.owner === "You" ? "✓ OWNED" : "▶ CLAIM"}
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div
          style={{
            flex: 1,
            minWidth: 160,
            background: "rgba(0,0,20,0.8)",
            border: "1px solid #FFC80033",
            borderRadius: 10,
            padding: 14,
          }}
        >
          <div
            style={{
              color: "#FFC800",
              fontWeight: 900,
              fontSize: 13,
              marginBottom: 10,
            }}
          >
            🏆 CONQUEST LEADERBOARD
          </div>
          {leaderboard.length === 0 ? (
            <div style={{ color: "#445566", fontSize: 11 }}>No data yet</div>
          ) : (
            leaderboard.slice(0, 8).map((e, i) => (
              <div
                key={e.principal}
                data-ocid={`conquest.leaderboard.item.${i + 1}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "4px 0",
                  borderBottom: "1px solid #FFFFFF11",
                }}
              >
                <span
                  style={{
                    color: i === 0 ? "#FFD700" : "#8899BB",
                    fontSize: 12,
                  }}
                >
                  {i + 1}. {truncatePrincipal(e.principal)}
                </span>
                <span style={{ color: "#FFC800", fontSize: 12 }}>
                  {e.planets}🌍
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Challenge Modal */}
      <AnimatePresence>
        {challengePlanet && challenge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 200,
              background: "rgba(0,0,0,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              data-ocid="conquest.dialog"
              style={{
                background: "rgba(0,5,20,0.98)",
                border: "1px solid #FFC80066",
                borderRadius: 14,
                padding: 24,
                maxWidth: 420,
                width: "100%",
                boxShadow: "0 0 40px #FFC80033",
              }}
            >
              <div
                style={{
                  color: "#FFC800",
                  fontSize: 16,
                  fontWeight: 900,
                  marginBottom: 6,
                }}
              >
                🌍 CLAIM: {challengePlanet}
              </div>
              <div style={{ color: "#8899BB", fontSize: 12, marginBottom: 16 }}>
                Complete the challenge to claim this planet! Challenge type:{" "}
                <span style={{ color: "#FFC800", textTransform: "uppercase" }}>
                  {challenge.type}
                </span>
              </div>
              {challenge.type === "click" && (
                <ClickChallenge
                  onSuccess={handleChallengeSuccess}
                  onFail={handleChallengeFail}
                />
              )}
              {challenge.type === "trivia" && (
                <TriviaChallenge
                  onSuccess={handleChallengeSuccess}
                  onFail={handleChallengeFail}
                />
              )}
              {challenge.type === "resource" && (
                <ResourceChallenge
                  onSuccess={handleChallengeSuccess}
                  onFail={handleChallengeFail}
                />
              )}
              <button
                type="button"
                data-ocid="conquest.cancel_button"
                onClick={() => {
                  setChallengePlanet(null);
                  setChallenge(null);
                }}
                style={{
                  marginTop: 16,
                  padding: "8px 20px",
                  borderRadius: 8,
                  border: "1px solid #FFFFFF22",
                  background: "transparent",
                  color: "#8899BB",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
