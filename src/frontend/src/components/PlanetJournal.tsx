import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetPlanetJournal,
  useSubmitJournalEntry,
} from "../hooks/useQueries";

const PANEL_STYLE: React.CSSProperties = {
  background: "rgba(11,16,23,0.92)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 14,
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  planetName: string;
  onJournalWritten?: () => void;
}

export function PlanetJournal({
  open,
  onOpenChange,
  planetName,
  onJournalWritten,
}: Props) {
  const [entry, setEntry] = useState("");
  const { identity, isLoginSuccess } = useInternetIdentity();
  const isLoggedIn =
    isLoginSuccess && !!identity && !identity.getPrincipal().isAnonymous();

  const { data: journals, isLoading } = useGetPlanetJournal(planetName, open);
  const { mutate: submitEntry, isPending } = useSubmitJournalEntry();

  function handleSubmit() {
    if (!entry.trim()) return;
    submitEntry(
      { planetName, entry: entry.trim() },
      {
        onSuccess: () => {
          toast.success("Journal entry saved!");
          setEntry("");
          onJournalWritten?.();
        },
        onError: () => toast.error("Failed to save entry"),
      },
    );
  }

  function formatTime(ts: bigint): string {
    try {
      const ms = Number(ts) / 1_000_000;
      return new Date(ms).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="journal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.65)",
          }}
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            data-ocid="journal.modal"
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            style={{
              ...PANEL_STYLE,
              padding: 28,
              width: 480,
              maxWidth: "95vw",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div>
                <div
                  style={{
                    color: "#F6C35B",
                    fontSize: 15,
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  📝 {planetName} Journal
                </div>
                <div style={{ color: "#9AA7B6", fontSize: 11, marginTop: 3 }}>
                  Traveler notes from the cosmos
                </div>
              </div>
              <button
                type="button"
                data-ocid="journal.close_button"
                onClick={() => onOpenChange(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9AA7B6",
                  cursor: "pointer",
                  fontSize: 20,
                  lineHeight: 1,
                  padding: 4,
                }}
              >
                ×
              </button>
            </div>

            {/* Write entry */}
            {isLoggedIn ? (
              <div style={{ marginBottom: 24 }}>
                <textarea
                  data-ocid="journal.textarea"
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  placeholder={`Write about your visit to ${planetName}...`}
                  rows={3}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 10,
                    padding: "12px 14px",
                    color: "#E9EEF5",
                    fontSize: 13,
                    resize: "none",
                    fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                    outline: "none",
                    marginBottom: 10,
                  }}
                />
                <button
                  type="button"
                  data-ocid="journal.submit_button"
                  disabled={!entry.trim() || isPending}
                  onClick={handleSubmit}
                  style={{
                    background: entry.trim()
                      ? "rgba(246,195,91,0.14)"
                      : "rgba(255,255,255,0.04)",
                    border: entry.trim()
                      ? "1px solid rgba(246,195,91,0.4)"
                      : "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    color: entry.trim() ? "#F6C35B" : "#9AA7B6",
                    padding: "8px 18px",
                    cursor: entry.trim() ? "pointer" : "not-allowed",
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                  }}
                >
                  {isPending ? "Saving..." : "📝 Add Entry"}
                </button>
              </div>
            ) : (
              <div
                style={{
                  background: "rgba(246,195,91,0.06)",
                  border: "1px solid rgba(246,195,91,0.2)",
                  borderRadius: 10,
                  padding: "14px 16px",
                  marginBottom: 20,
                  color: "#D8BE8B",
                  fontSize: 12,
                }}
              >
                🔒 Login to write a journal entry
              </div>
            )}

            {/* Entries list */}
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.08)",
                paddingTop: 16,
              }}
            >
              <div
                style={{
                  color: "#9AA7B6",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 12,
                }}
              >
                Traveler Notes
              </div>
              {isLoading ? (
                <div
                  data-ocid="journal.loading_state"
                  style={{
                    color: "#9AA7B6",
                    fontSize: 12,
                    textAlign: "center",
                    padding: "20px 0",
                  }}
                >
                  Loading entries...
                </div>
              ) : !journals || journals.length === 0 ? (
                <div
                  data-ocid="journal.empty_state"
                  style={{
                    color: "#9AA7B6",
                    fontSize: 12,
                    textAlign: "center",
                    padding: "20px 0",
                  }}
                >
                  No entries yet. Be the first to write about {planetName}!
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {journals.map((j, i) => (
                    <div
                      // biome-ignore lint/suspicious/noArrayIndexKey: static list with stable order
                      key={i}
                      data-ocid={`journal.item.${i + 1}`}
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 10,
                        padding: "12px 14px",
                      }}
                    >
                      <div
                        style={{
                          color: "#E9EEF5",
                          fontSize: 13,
                          lineHeight: 1.6,
                          marginBottom: 8,
                        }}
                      >
                        {j.entry}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            color: "#9AA7B6",
                            fontSize: 10,
                            fontFamily: "monospace",
                          }}
                        >
                          {j.author.toString().slice(0, 10)}...
                        </span>
                        <span style={{ color: "#9AA7B6", fontSize: 10 }}>
                          {formatTime(j.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
