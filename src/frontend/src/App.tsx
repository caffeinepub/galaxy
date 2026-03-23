import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import {
  type AchievementState,
  AchievementsPanel,
  loadAchievements as loadAchievementsData,
  saveAchievements as saveAchievementsData,
} from "./components/Achievements";
import { AdminDashboard } from "./components/AdminDashboard";
import { AudioSettings } from "./components/AudioSettings";
import { CreditShop } from "./components/CreditShop";
import { DailyChallenge } from "./components/DailyChallenge";
import { DailyTaskPanel } from "./components/DailyTaskPanel";
import { DonationModal } from "./components/DonationModal";
import { ErrorBoundary } from "./components/ErrorBoundary";
import GameArcade from "./components/GameArcade";
import { LandingScreen } from "./components/LandingScreen";
import { Leaderboard } from "./components/Leaderboard";
import { MultiverseView } from "./components/MultiverseView";
import { NovaCreditsDisplay } from "./components/NovaCreditsDisplay";
import { SpaceMissions } from "./components/SpaceMissions";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { audioManager } from "./utils/AudioManager";

function hasPendingChallenge(): boolean {
  try {
    const last = localStorage.getItem("last_challenge_date");
    const today = new Date().toDateString();
    return last !== today;
  } catch {
    return false;
  }
}

function loadAchievements(): AchievementState {
  try {
    return loadAchievementsData();
  } catch {
    return {
      visitedPlanets: [],
      usedGalaxyView: false,
      landedOnSurface: false,
      usedQuiz: false,
      namedAStar: false,
      wrotePlanetJournal: false,
    };
  }
}

function saveAchievements(state: AchievementState) {
  try {
    saveAchievementsData(state);
  } catch {
    /* */
  }
}

function getRank(credits: number): string {
  if (credits >= 10000) return "Legend";
  if (credits >= 5000) return "Admiral";
  if (credits >= 2000) return "Commander";
  if (credits >= 500) return "Explorer";
  return "Cadet";
}

export default function App() {
  const [donationOpen, setDonationOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [missionsOpen, setMissionsOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [dailyChallengeOpen, setDailyChallengeOpen] = useState(false);
  const [multiverseOpen, setMultiverseOpen] = useState(false);
  const [pendingChallenge, setPendingChallenge] = useState(() =>
    hasPendingChallenge(),
  );
  const [audioSettingsOpen, setAudioSettingsOpen] = useState(false);
  const [creditShopOpen, setCreditShopOpen] = useState(false);
  const [dailyTasksOpen, setDailyTasksOpen] = useState(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);
  const [arcadeOpen, setArcadeOpen] = useState(false);
  const [novaCredits, setNovaCredits] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [achievements, setAchievements] = useState<AchievementState>(() =>
    loadAchievements(),
  );

  const { identity } = useInternetIdentity();
  const isLoggedIn = !!(identity && !identity.getPrincipal().isAnonymous());
  const { actor } = useActor();

  // Init audio on first interaction
  useEffect(() => {
    function initAudio() {
      audioManager.init();
    }
    document.addEventListener("click", initAudio, { once: true });
    document.addEventListener("keydown", initAudio, { once: true });
    return () => {
      document.removeEventListener("click", initAudio);
      document.removeEventListener("keydown", initAudio);
    };
  }, []);

  // Load credits and admin status on login
  useEffect(() => {
    if (!isLoggedIn || !actor) return;
    async function initUser() {
      try {
        const [bal, adminStatus] = await Promise.all([
          actor!.getBalance(),
          actor!.isCallerAdmin(),
          actor!.recordLogin(),
        ]);
        setNovaCredits(Number(bal));
        setIsAdmin(adminStatus);
      } catch {
        /* non-fatal */
      }
    }
    initUser();
  }, [isLoggedIn, actor]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      audioManager.setMasterVolume(next ? 0 : 0.5);
      return next;
    });
  }, []);

  const updateAchievement = useCallback((update: Partial<AchievementState>) => {
    setAchievements((prev) => {
      const next = { ...prev, ...update };
      saveAchievements(next);
      return next;
    });
  }, []);

  const handleNavigate = useCallback((dest: string) => {
    switch (dest) {
      case "multiverse":
        setMultiverseOpen(true);
        break;
      case "arcade":
        setArcadeOpen(true);
        break;
      case "missions":
        setMissionsOpen(true);
        break;
      case "leaderboard":
        setLeaderboardOpen(true);
        break;
      case "dailytasks":
        setDailyTasksOpen(true);
        break;
      case "shop":
        setCreditShopOpen(true);
        break;
      default:
        break;
    }
  }, []);

  const handleSpendCredits = useCallback((amount: number) => {
    setNovaCredits((prev) => Math.max(0, prev - amount));
  }, []);

  const handleEarnCredits = useCallback((amount: number) => {
    setNovaCredits((prev) => prev + amount);
  }, []);

  // suppress unused warning
  void updateAchievement;

  return (
    <ErrorBoundary>
      <div
        style={{
          width: "100vw",
          height: "100dvh",
          overflow: "hidden",
          background: "#060C14",
          position: "relative",
        }}
      >
        {/* Background: LandingScreen always rendered */}
        <LandingScreen
          onNavigate={handleNavigate}
          isLoggedIn={isLoggedIn}
          novaCredits={novaCredits}
          isAdmin={isAdmin}
          onOpenAdmin={() => setAdminDashboardOpen(true)}
          onOpenShop={() => setCreditShopOpen(true)}
          onOpenAudio={() => setAudioSettingsOpen(true)}
          onOpenAchievements={() => setAchievementsOpen(true)}
          onOpenDonate={() => setDonationOpen(true)}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          rank={getRank(novaCredits)}
        />

        {/* Nova Credits HUD */}
        {isLoggedIn && (
          <NovaCreditsDisplay
            credits={novaCredits}
            rank={getRank(novaCredits)}
          />
        )}

        {/* Daily challenge badge */}
        {pendingChallenge && isLoggedIn && (
          <button
            type="button"
            data-ocid="landing.daily_challenge.button"
            onClick={() => setDailyChallengeOpen(true)}
            style={{
              position: "fixed",
              bottom: 80,
              right: 20,
              zIndex: 40,
              background: "rgba(246,195,91,0.12)",
              border: "1px solid rgba(246,195,91,0.45)",
              borderRadius: 9999,
              padding: "8px 16px",
              color: "#F6C35B",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.08em",
              backdropFilter: "blur(8px)",
              animation: "pulse-badge 2s ease-in-out infinite",
              minHeight: 44,
              fontFamily: "inherit",
            }}
          >
            ⚡ Daily Challenge!
          </button>
        )}

        {/* ── Overlays ── */}
        <AnimatePresence>
          {multiverseOpen && (
            <motion.div
              key="multiverse"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              style={{ position: "fixed", inset: 0, zIndex: 50 }}
            >
              <MultiverseView onClose={() => setMultiverseOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {arcadeOpen && (
            <motion.div
              key="arcade"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              style={{ position: "fixed", inset: 0, zIndex: 50 }}
            >
              <GameArcade
                open={arcadeOpen}
                onClose={() => setArcadeOpen(false)}
                novaCredits={novaCredits}
                onSpendCredits={handleSpendCredits}
                onEarnCredits={handleEarnCredits}
                isLoggedIn={isLoggedIn}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {missionsOpen && (
            <motion.div
              key="missions"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              style={{ position: "fixed", inset: 0, zIndex: 50 }}
            >
              <SpaceMissions
                open={missionsOpen}
                onOpenChange={setMissionsOpen}
                novaCredits={novaCredits}
                onCreditsSpent={handleSpendCredits}
                onCreditsEarned={handleEarnCredits}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {leaderboardOpen && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              style={{ position: "fixed", inset: 0, zIndex: 50 }}
            >
              <Leaderboard
                open={leaderboardOpen}
                onOpenChange={setLeaderboardOpen}
                isLoggedIn={isLoggedIn}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {adminDashboardOpen && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              style={{ position: "fixed", inset: 0, zIndex: 50 }}
            >
              <AdminDashboard
                isOpen={adminDashboardOpen}
                onClose={() => setAdminDashboardOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {creditShopOpen && (
            <motion.div
              key="creditshop"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              style={{ position: "fixed", inset: 0, zIndex: 50 }}
            >
              <CreditShop
                isOpen={creditShopOpen}
                onClose={() => setCreditShopOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {dailyTasksOpen && (
            <motion.div
              key="dailytasks"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              style={{ position: "fixed", inset: 0, zIndex: 50 }}
            >
              <DailyTaskPanel
                isOpen={dailyTasksOpen}
                onClose={() => setDailyTasksOpen(false)}
                onCreditsEarned={handleEarnCredits}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {donationOpen && (
            <motion.div
              key="donation"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              style={{ position: "fixed", inset: 0, zIndex: 50 }}
            >
              <DonationModal
                open={donationOpen}
                onOpenChange={setDonationOpen}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {dailyChallengeOpen && (
            <motion.div
              key="challenge"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              style={{ position: "fixed", inset: 0, zIndex: 50 }}
            >
              <DailyChallenge
                open={dailyChallengeOpen}
                onOpenChange={(v) => {
                  setDailyChallengeOpen(v);
                  if (!v) {
                    setPendingChallenge(false);
                    try {
                      localStorage.setItem(
                        "last_challenge_date",
                        new Date().toDateString(),
                      );
                    } catch {
                      /* */
                    }
                  }
                }}
                onCreditsEarned={handleEarnCredits}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {achievementsOpen && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              style={{ position: "fixed", inset: 0, zIndex: 50 }}
            >
              <AchievementsPanel
                open={achievementsOpen}
                onOpenChange={setAchievementsOpen}
                achievements={achievements}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {audioSettingsOpen && (
            <motion.div
              key="audio"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              style={{ position: "fixed", inset: 0, zIndex: 50 }}
            >
              <AudioSettings
                open={audioSettingsOpen}
                onClose={() => setAudioSettingsOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <Toaster />

        <style>{`
          @keyframes pulse-badge {
            0%, 100% { box-shadow: 0 0 0 0 rgba(246,195,91,0.4); }
            50% { box-shadow: 0 0 0 8px rgba(246,195,91,0); }
          }
        `}</style>
      </div>
    </ErrorBoundary>
  );
}
