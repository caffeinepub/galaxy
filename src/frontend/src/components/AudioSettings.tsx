import { Volume2, VolumeX, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { audioManager } from "../utils/AudioManager";
import type { AudioCategory } from "../utils/AudioManager";

interface AudioSettingsProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<AudioCategory, string> = {
  ambient: "Ambient Sounds",
  planet: "Planet Sounds",
  event: "Event Sounds (Comets, Flares)",
  ui: "UI Sounds",
  mission: "Mission Audio",
};

const CATEGORY_ICONS: Record<AudioCategory, string> = {
  ambient: "🌌",
  planet: "🪐",
  event: "☄️",
  ui: "🔔",
  mission: "🚀",
};

export function AudioSettings({ open, onClose }: AudioSettingsProps) {
  const [masterVolume, setMasterVolume] = useState(60);
  const [categoryMuted, setCategoryMuted] = useState<
    Record<AudioCategory, boolean>
  >({
    ambient: false,
    planet: false,
    event: false,
    ui: false,
    mission: false,
  });

  const cats: AudioCategory[] = ["ambient", "planet", "event", "ui", "mission"];

  useEffect(() => {
    if (open) {
      // Sync state from AudioManager
      const vol = Math.round(audioManager.getMasterVolume() * 100);
      setMasterVolume(vol);
      const muted: Record<AudioCategory, boolean> = {
        ambient: false,
        planet: false,
        event: false,
        ui: false,
        mission: false,
      };
      for (const cat of cats) {
        muted[cat] = audioManager.getCategoryMuted(cat);
      }
      setCategoryMuted(muted);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleVolumeChange(v: number) {
    setMasterVolume(v);
    audioManager.init();
    audioManager.setMasterVolume(v / 100);
  }

  function toggleCategory(cat: AudioCategory) {
    audioManager.init();
    const newMuted = !categoryMuted[cat];
    audioManager.setCategoryMuted(cat, newMuted);
    setCategoryMuted((prev) => ({ ...prev, [cat]: newMuted }));
    if (!newMuted) {
      // Play a UI click to confirm audio is on
      if (cat === "ui") setTimeout(() => audioManager.playUIClick(), 100);
    }
  }

  const btnStyle = (active: boolean): React.CSSProperties => ({
    background: active ? "rgba(246,195,91,0.12)" : "rgba(255,255,255,0.04)",
    border: active
      ? "1px solid rgba(246,195,91,0.4)"
      : "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    color: active ? "#F6C35B" : "#9AA7B6",
    cursor: "pointer",
    padding: "6px 12px",
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "inherit",
    letterSpacing: "0.06em",
    display: "flex",
    alignItems: "center",
    gap: 6,
    transition: "all 0.15s",
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="audio-settings"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 320,
            background: "rgba(11,16,23,0.96)",
            border: "1px solid rgba(246,195,91,0.25)",
            borderRadius: 18,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            padding: 24,
            fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
            zIndex: 10100,
            boxShadow:
              "0 8px 40px rgba(0,0,0,0.6), 0 0 60px rgba(246,195,91,0.06)",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Volume2 size={16} color="#F6C35B" />
              <span
                style={{
                  color: "#F6C35B",
                  fontSize: 14,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Audio Settings
              </span>
            </div>
            <button
              type="button"
              data-ocid="audio_settings.close_button"
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                color: "#9AA7B6",
                cursor: "pointer",
                padding: "5px",
                display: "flex",
              }}
            >
              <X size={13} />
            </button>
          </div>

          {/* Master volume */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  color: "#C8D4E0",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Master Volume
              </span>
              <span style={{ color: "#F6C35B", fontSize: 12, fontWeight: 800 }}>
                {masterVolume}%
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <VolumeX size={13} color="#5a6a7a" />
              <input
                data-ocid="audio_settings.input"
                type="range"
                min={0}
                max={100}
                step={1}
                value={masterVolume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                style={{ flex: 1, accentColor: "#F6C35B", cursor: "pointer" }}
              />
              <Volume2 size={13} color="#F6C35B" />
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background: "rgba(255,255,255,0.07)",
              marginBottom: 16,
            }}
          />

          {/* Category toggles */}
          <div style={{ marginBottom: 8 }}>
            <span
              style={{
                color: "rgba(200,212,224,0.5)",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Audio Channels
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {cats.map((cat) => {
              const muted = categoryMuted[cat];
              return (
                <div
                  key={cat}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span style={{ fontSize: 14 }}>{CATEGORY_ICONS[cat]}</span>
                    <span
                      style={{
                        color: muted ? "#5a6a7a" : "#C8D4E0",
                        fontSize: 11,
                        fontWeight: 600,
                        transition: "color 0.15s",
                      }}
                    >
                      {CATEGORY_LABELS[cat]}
                    </span>
                  </div>
                  <button
                    type="button"
                    data-ocid={`audio_settings.${cat}_toggle`}
                    onClick={() => toggleCategory(cat)}
                    style={btnStyle(!muted)}
                  >
                    {muted ? <VolumeX size={11} /> : <Volume2 size={11} />}
                    {muted ? "Off" : "On"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Test sound button */}
          <div
            style={{
              marginTop: 18,
              paddingTop: 14,
              borderTop: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <button
              type="button"
              data-ocid="audio_settings.primary_button"
              onClick={() => {
                audioManager.init();
                audioManager.playUIClick();
                setTimeout(() => audioManager.playPlanetSound("Earth"), 300);
              }}
              style={{
                width: "100%",
                padding: "10px",
                background: "rgba(246,195,91,0.08)",
                border: "1px solid rgba(246,195,91,0.3)",
                borderRadius: 10,
                color: "#F6C35B",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                fontFamily: "inherit",
              }}
            >
              🔊 Test Sound
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
