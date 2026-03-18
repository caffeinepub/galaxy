import { useCallback, useEffect, useRef, useState } from "react";

type AudioMode = "space" | "surface";

export function useSpaceAudio(mode: AudioMode, planetName?: string) {
  const [isMuted, setIsMuted] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);
  const startedRef = useRef(false);

  const createSpaceAmbient = useCallback(
    (ctx: AudioContext, masterGain: GainNode) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 40;
      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.04;
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 200;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.02;
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(masterGain);
      noise.start();

      nodesRef.current = [osc, noise];
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 2);
    },
    [],
  );

  const createSurfaceAmbient = useCallback(
    (ctx: AudioContext, masterGain: GainNode, planet: string) => {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";

      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      const lfoGain = ctx.createGain();

      let targetGain = 0.07;

      if (planet === "Earth") {
        filter.frequency.value = 600;
        lfo.frequency.value = 0.3;
        lfoGain.gain.value = 200;
        targetGain = 0.08;
      } else if (planet === "Mars") {
        filter.frequency.value = 800;
        lfo.frequency.value = 0.8;
        lfoGain.gain.value = 300;
        targetGain = 0.07;
      } else if (planet === "Venus") {
        filter.frequency.value = 300;
        lfo.frequency.value = 0.2;
        lfoGain.gain.value = 100;
        targetGain = 0.08;

        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = 60;
        const oscGain = ctx.createGain();
        oscGain.gain.value = 0.03;
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
        nodesRef.current.push(osc);
      } else if (["Jupiter", "Saturn", "Uranus", "Neptune"].includes(planet)) {
        filter.frequency.value = 500;
        lfo.frequency.value = 2.5;
        lfoGain.gain.value = 400;
        targetGain = 0.09;
      } else {
        // Mercury
        filter.frequency.value = 200;
        lfo.frequency.value = 0.1;
        lfoGain.gain.value = 50;
        targetGain = 0.03;
      }

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start();

      nodesRef.current.push(noise, lfo);
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 2);
    },
    [],
  );

  const start = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    gainRef.current = masterGain;

    if (mode === "space") {
      createSpaceAmbient(ctx, masterGain);
    } else {
      createSurfaceAmbient(ctx, masterGain, planetName ?? "");
    }
  }, [mode, planetName, createSpaceAmbient, createSurfaceAmbient]);

  useEffect(() => {
    const resume = () => {
      if (!startedRef.current) start();
      ctxRef.current?.resume();
    };
    document.addEventListener("click", resume, { once: true });
    document.addEventListener("keydown", resume, { once: true });

    return () => {
      document.removeEventListener("click", resume);
      document.removeEventListener("keydown", resume);
    };
  }, [start]);

  useEffect(() => {
    return () => {
      if (gainRef.current && ctxRef.current) {
        const ctx = ctxRef.current;
        const g = gainRef.current;
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
        setTimeout(() => ctx.close(), 1100);
      }
    };
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (gainRef.current && ctxRef.current) {
        const ctx = ctxRef.current;
        if (next) {
          gainRef.current.gain.linearRampToValueAtTime(
            0,
            ctx.currentTime + 0.5,
          );
        } else {
          gainRef.current.gain.linearRampToValueAtTime(
            0.07,
            ctx.currentTime + 0.5,
          );
        }
      }
      return next;
    });
  }, []);

  return { isMuted, toggleMute };
}
