import { useEffect, useRef, useState } from "react";

// How loud counts as "blowing". Quiet room ≈ 0.02, a real blow ≈ 0.15+.
// If candles go out from talking, raise it. If blowing does nothing, lower it.
const THRESHOLD = 0.09;

export default function useMic(onBlow) {
  const [status, setStatus] = useState("idle"); // "idle" | "on" | "denied"
  const parts = useRef({}); // { stream, ctx, raf } — things we must clean up

  // always call the latest onBlow, even though the loop below was started earlier
  const onBlowRef = useRef(onBlow);
  useEffect(() => {
    onBlowRef.current = onBlow;
  });

  const stop = () => {
    const { raf, stream, ctx } = parts.current;
    cancelAnimationFrame(raf);
    stream?.getTracks().forEach((t) => t.stop()); // turns off the mic light
    if (ctx && ctx.state !== "closed") ctx.close();
    parts.current = {};
  };

  const start = async () => {
    if (parts.current.stream) return; // already running

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        // phones try to "clean up" your voice, which also removes blowing noise
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });

      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      await ctx.resume(); // iPhones start audio paused

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.fftSize);

      parts.current = { stream, ctx };
      setStatus("on");

      // runs every frame (~60 times a second)
      const tick = () => {
        analyser.getByteTimeDomainData(data);

        // RMS = average loudness of this slice of sound
        let sum = 0;
        for (const v of data) {
          const d = (v - 128) / 128; // 128 is silence, so centre on 0
          sum += d * d;
        }
        const rms = Math.sqrt(sum / data.length);

        if (rms > THRESHOLD) onBlowRef.current((rms - THRESHOLD) * 0.9);
        parts.current.raf = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      setStatus("denied"); // no permission, no mic, or not on https
    }
  };

  useEffect(() => stop, []); // turn the mic off when the cake leaves the screen

  return { status, start, stop };
}