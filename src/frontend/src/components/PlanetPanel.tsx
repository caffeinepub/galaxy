import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Circle,
  Clock,
  Navigation,
  Star,
  Telescope,
  Thermometer,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveProfile, useUserProfile } from "../hooks/useQueries";

export interface PlanetDetails {
  name: string;
  color: string;
  diameter: string;
  moons: number;
  temperature: string;
  orbitalPeriod: string;
  distanceFromSun: string;
  surfaceType: string;
  surfaceDesc: string;
  funFact: string;
  atmosphere: string;
}

export const PLANET_DETAILS: Record<string, PlanetDetails> = {
  Mercury: {
    name: "Mercury",
    color: "#b5b5b5",
    diameter: "4,879 km",
    moons: 0,
    temperature: "-180°C to +430°C",
    orbitalPeriod: "88 Earth days",
    distanceFromSun: "0.39 AU",
    surfaceType: "Rocky / Cratered",
    surfaceDesc:
      "A desolate, heavily cratered world with extreme temperature swings. No atmosphere to retain heat. Ancient impact craters cover its entire surface.",
    funFact:
      "Despite being closest to the Sun, Mercury is not the hottest planet — Venus is, due to its thick atmosphere.",
    atmosphere: "Virtually none (thin exosphere)",
  },
  Venus: {
    name: "Venus",
    color: "#e8cda0",
    diameter: "12,104 km",
    moons: 0,
    temperature: "465°C (average)",
    orbitalPeriod: "225 Earth days",
    distanceFromSun: "0.72 AU",
    surfaceType: "Volcanic Plains",
    surfaceDesc:
      "Shrouded in thick, toxic clouds of sulfuric acid. Volcanic plains, highland plateaus, and massive shield volcanoes define its surface.",
    funFact:
      "Venus rotates backwards compared to most planets, and its day is longer than its year.",
    atmosphere: "96% CO₂, crushing pressure (93×Earth)",
  },
  Earth: {
    name: "Earth",
    color: "#4fa3e0",
    diameter: "12,742 km",
    moons: 1,
    temperature: "-88°C to +58°C",
    orbitalPeriod: "365 Earth days",
    distanceFromSun: "1.00 AU",
    surfaceType: "Oceans & Continents",
    surfaceDesc:
      "71% covered by liquid water oceans. Lush green continents, polar ice caps, and the only known planet teeming with diverse life.",
    funFact:
      "Earth is the densest planet in the Solar System and the only one not named after a Roman or Greek deity.",
    atmosphere: "78% N₂, 21% O₂ — perfect for life",
  },
  Mars: {
    name: "Mars",
    color: "#c1440e",
    diameter: "6,779 km",
    moons: 2,
    temperature: "-125°C to +20°C",
    orbitalPeriod: "687 Earth days",
    distanceFromSun: "1.52 AU",
    surfaceType: "Iron Oxide Desert",
    surfaceDesc:
      "A rust-red desert world with the tallest volcano in the Solar System — Olympus Mons (21km). Ancient river valleys hint at a watery past.",
    funFact:
      "Mars has the largest dust storms in the Solar System, sometimes engulfing the entire planet for months.",
    atmosphere: "95% CO₂, thin (0.6% of Earth's)",
  },
  Jupiter: {
    name: "Jupiter",
    color: "#c88b3a",
    diameter: "139,820 km",
    moons: 95,
    temperature: "-110°C (cloud tops)",
    orbitalPeriod: "12 Earth years",
    distanceFromSun: "5.2 AU",
    surfaceType: "Gas Giant",
    surfaceDesc:
      "A colossal ball of hydrogen and helium with no solid surface. The Great Red Spot is a storm raging for over 350 years, wider than Earth.",
    funFact:
      "Jupiter's magnetic field is 20,000 times stronger than Earth's, creating auroras at its poles.",
    atmosphere: "89% H₂, 10% He — no solid surface",
  },
  Saturn: {
    name: "Saturn",
    color: "#e4d191",
    diameter: "116,460 km",
    moons: 146,
    temperature: "-140°C (cloud tops)",
    orbitalPeriod: "29 Earth years",
    distanceFromSun: "9.5 AU",
    surfaceType: "Gas Giant + Ice Rings",
    surfaceDesc:
      "Famous for its spectacular ring system made of billions of ice and rock particles. Despite its enormous size, Saturn is less dense than water.",
    funFact:
      "Saturn's rings are only about 20 meters thick on average, despite spanning 282,000 km in diameter.",
    atmosphere: "96% H₂ — would float in water",
  },
  Uranus: {
    name: "Uranus",
    color: "#7de8e8",
    diameter: "50,724 km",
    moons: 28,
    temperature: "-195°C (average)",
    orbitalPeriod: "84 Earth years",
    distanceFromSun: "19.2 AU",
    surfaceType: "Ice Giant",
    surfaceDesc:
      "A pale blue-green ice giant that rotates on its side (98° axial tilt). Methane gas in its atmosphere absorbs red light, giving it a cyan hue.",
    funFact:
      "Uranus was the first planet discovered with a telescope, by William Herschel in 1781.",
    atmosphere: "83% H₂, 15% He, 2% methane",
  },
  Neptune: {
    name: "Neptune",
    color: "#3f54ba",
    diameter: "49,244 km",
    moons: 16,
    temperature: "-200°C (average)",
    orbitalPeriod: "165 Earth years",
    distanceFromSun: "30 AU",
    surfaceType: "Ice Giant",
    surfaceDesc:
      "The windiest planet — supersonic storms reach 2,100 km/h. A deep blue ice giant with a great dark storm system similar to Jupiter's Red Spot.",
    funFact:
      "Neptune takes 165 years to orbit the Sun — it has only completed one full orbit since its discovery in 1846.",
    atmosphere: "80% H₂, 19% He, traces of methane",
  },
};

interface PlanetPanelProps {
  planet: PlanetDetails | null;
  onClose: () => void;
}

export function PlanetPanel({ planet, onClose }: PlanetPanelProps) {
  const { identity } = useInternetIdentity();
  const { data: profile } = useUserProfile();
  const { mutate: saveProfile, isPending } = useSaveProfile();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const isFavorite = profile?.favoritePlanet === planet?.name;

  function handleSetFavorite() {
    if (!planet || !isLoggedIn) return;
    const principal = identity!.getPrincipal().toString();
    saveProfile({
      name: profile?.name || principal.slice(0, 12),
      favoritePlanet: planet.name,
      role: profile?.role ?? ("user" as any),
    });
  }

  return (
    <AnimatePresence>
      {planet && (
        <motion.div
          key="planet-panel"
          initial={{ x: 420, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 420, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          data-ocid="planet.panel"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 380,
            height: "100%",
            background:
              "linear-gradient(180deg, rgba(11,16,23,0.97) 0%, rgba(15,20,32,0.95) 100%)",
            borderLeft: "1px solid rgba(246,195,91,0.18)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            overflowY: "auto",
            zIndex: 50,
            fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "28px 24px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              position: "sticky",
              top: 0,
              background: "rgba(11,16,23,0.95)",
              backdropFilter: "blur(12px)",
              zIndex: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: planet.color,
                    boxShadow: `0 0 16px ${planet.color}80`,
                    flexShrink: 0,
                  }}
                />
                <h2
                  style={{
                    color: "#F6C35B",
                    fontSize: 22,
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    margin: 0,
                    textTransform: "uppercase",
                  }}
                >
                  {planet.name}
                </h2>
                {isFavorite && (
                  <Badge
                    style={{
                      background: "rgba(246,195,91,0.15)",
                      color: "#F6C35B",
                      border: "1px solid rgba(246,195,91,0.3)",
                      fontSize: 9,
                    }}
                  >
                    ★ Favorite
                  </Badge>
                )}
              </div>
              <button
                type="button"
                data-ocid="planet.close_button"
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8,
                  color: "#9AA7B6",
                  cursor: "pointer",
                  padding: "6px 8px",
                  display: "flex",
                  alignItems: "center",
                }}
                aria-label="Close planet panel"
              >
                <X size={16} />
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
              }}
            >
              <Badge
                variant="outline"
                style={{
                  borderColor: "rgba(255,255,255,0.15)",
                  color: "#9AA7B6",
                  fontSize: 10,
                }}
              >
                {planet.surfaceType}
              </Badge>
              <Badge
                variant="outline"
                style={{
                  borderColor: "rgba(255,255,255,0.15)",
                  color: "#9AA7B6",
                  fontSize: 10,
                }}
              >
                {planet.moons} {planet.moons === 1 ? "moon" : "moons"}
              </Badge>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ padding: "20px 24px" }}>
            <p
              style={{
                color: "#9AA7B6",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: 14,
                margin: "0 0 14px",
              }}
            >
              Surface & Stats
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 20,
              }}
            >
              {[
                {
                  icon: <Circle size={13} />,
                  label: "Diameter",
                  value: planet.diameter,
                },
                {
                  icon: <Star size={13} />,
                  label: "Moons",
                  value: String(planet.moons),
                },
                {
                  icon: <Thermometer size={13} />,
                  label: "Temperature",
                  value: planet.temperature,
                },
                {
                  icon: <Clock size={13} />,
                  label: "Orbital Period",
                  value: planet.orbitalPeriod,
                },
                {
                  icon: <Navigation size={13} />,
                  label: "Distance",
                  value: planet.distanceFromSun,
                },
                {
                  icon: <Telescope size={13} />,
                  label: "Atmosphere",
                  value: planet.atmosphere,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    padding: "10px 12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      color: "#9AA7B6",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: 5,
                    }}
                  >
                    {stat.icon}
                    {stat.label}
                  </div>
                  <div
                    style={{
                      color: "#E9EEF5",
                      fontSize: 11,
                      fontWeight: 600,
                      lineHeight: 1.3,
                    }}
                  >
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            <Separator
              style={{ background: "rgba(255,255,255,0.08)", marginBottom: 16 }}
            />

            <div style={{ marginBottom: 16 }}>
              <p
                style={{
                  color: "#9AA7B6",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                  margin: "0 0 8px",
                }}
              >
                Surface Description
              </p>
              <p
                style={{
                  color: "#C8D0DC",
                  fontSize: 12,
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {planet.surfaceDesc}
              </p>
            </div>

            <Separator
              style={{ background: "rgba(255,255,255,0.08)", marginBottom: 16 }}
            />

            <div
              style={{
                background: "rgba(246,195,91,0.06)",
                border: "1px solid rgba(246,195,91,0.15)",
                borderRadius: 10,
                padding: "12px 14px",
                marginBottom: 20,
              }}
            >
              <p
                style={{
                  color: "#F6C35B",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  margin: "0 0 6px",
                }}
              >
                ✦ Fun Fact
              </p>
              <p
                style={{
                  color: "#D8BE8B",
                  fontSize: 12,
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {planet.funFact}
              </p>
            </div>

            {isLoggedIn ? (
              <Button
                data-ocid="planet.save_button"
                onClick={handleSetFavorite}
                disabled={isPending || isFavorite}
                style={{
                  width: "100%",
                  background: isFavorite
                    ? "rgba(246,195,91,0.15)"
                    : "rgba(246,195,91,0.2)",
                  border: "1px solid rgba(246,195,91,0.4)",
                  color: "#F6C35B",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  fontSize: 12,
                }}
              >
                {isFavorite ? "★ Set as Favorite" : "☆ Set as Favorite"}
              </Button>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  color: "#9AA7B6",
                  fontSize: 11,
                  padding: "10px 0",
                }}
              >
                Login to save this as your favorite planet
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
