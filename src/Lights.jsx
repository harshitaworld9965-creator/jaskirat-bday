import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const BULBS = 13;

// Place each bulb on the same curve the wire is drawn with.
// The wire goes from (0, 8) to (100, 8) and sags to 24 in the middle,
// so for a point t (0 → 1) along it: x = 100t, y = 8 + 64·t·(1 − t)
const POSITIONS = Array.from({ length: BULBS }, (_, i) => {
  const t = (i + 0.5) / BULBS;
  return { left: t * 100, top: 8 + 64 * t * (1 - t) };
});

export default function Lights({ onDone }) {
  const root = useRef(null);
  const bulbs = useRef([]);

  useGSAP(
    () => {
      const tl = gsap.timeline({ onComplete: onDone });

      // 1. first line fades in, holds, fades out
      tl.to(".t1", { opacity: 1, duration: 0.8, delay: 0.6 })
        .to(".t1", { opacity: 0, duration: 0.5, delay: 1.4 });

      // 2. bulbs switch on one after another, left to right
      const start = tl.duration();
      bulbs.current.forEach((bulb, i) => {
        tl.call(() => bulb.classList.add("on"), null, start + i * 0.13);
      });

      // 3. second line, then a pause before the story starts
      tl.to(".t2", { opacity: 1, duration: 0.6 }, "+=0.4")
        .to({}, { duration: 1.7 });
    },
    { scope: root }
  );

  return (
    <div className="scene" ref={root}>
      <div className="string">
        <svg viewBox="0 0 100 40" preserveAspectRatio="none">
          <path
            d="M0 8 Q 50 40 100 8"
            fill="none"
            stroke="#2a2a2a"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {POSITIONS.map((p, i) => (
          <div
            key={i}
            className="bulb"
            ref={(el) => (bulbs.current[i] = el)}
            style={{ left: `${p.left}%`, top: `${p.top}px` }}
          />
        ))}
      </div>

      <p className="lights-text t1" style={{ gridArea: "1 / 1" }}>
        it’s dark in here.<br />let’s fix that.
      </p>
      <p className="lights-text t2" style={{ gridArea: "1 / 1" }}>
        better.<br />now, a few things I remember.
      </p>
    </div>
  );
}