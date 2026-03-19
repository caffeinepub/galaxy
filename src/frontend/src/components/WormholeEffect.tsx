import { AnimatePresence, motion } from "motion/react";

interface Props {
  active: boolean;
  onDone?: () => void;
}

export function WormholeEffect({ active, onDone }: Props) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="wormhole"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.1, 1.3, 2.5] }}
          transition={{ duration: 1.2, times: [0, 0.2, 0.7, 1] }}
          onAnimationComplete={onDone}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse at center, rgba(246,195,91,0.0) 0%, rgba(100,60,200,0.4) 40%, rgba(20,10,50,0.95) 70%, rgba(0,0,0,1) 100%)",
          }}
        />
      )}
    </AnimatePresence>
  );
}
