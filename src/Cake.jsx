import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import useMic from "./useMic";

const CANDLES = 5;

const MESSAGES = {
  idle: "tap start, then blow into the phone — for real",
  on: "mic is on — blow",
  denied: "no mic here — hold the button instead",
};

export default function Cake({ onDone }) {
  const root = useRef(null);
  const meter = useRef(null);
  const flames = useRef([]);
  const smokes = useRef([]);

  // these change ~60 times a second, so they live in refs, not state
  const energy = useRef(0); // 0 → 1, one full bar = one candle out
  const out = useRef(0);    // how many candles are out
  const holdTimer = useRef(null);

  const mic = useMic((level) => feed(level));

  // entrance animation; useGSAP cleans it up automatically
  const { contextSafe } = useGSAP(
    () => {
      gsap.from(".cake-wrap", { y: 40, opacity: 0, duration: 0.9, ease: "power2.out" });
    },
    { scope: root }
  );

  const killOne = contextSafe(() => {
    if (out.current >= CANDLES) return;
    const i = out.current++;

    // flame squashes and disappears
    gsap.to(flames.current[i], { scaleY: 0.2, scaleX: 0.6, opacity: 0, duration: 0.25, ease: "power2.in" });

    // a puff of smoke drifts up
    gsap.fromTo(
      smokes.current[i],
      { opacity: 0.8, y: 0, x: 0, scale: 1 },
      { opacity: 0, y: -60, x: (Math.random() - 0.5) * 30, scale: 3, duration: 1.4, ease: "power1.out" }
    );

    // the warm glow dims with every candle
    gsap.to(".glow", { opacity: 1 - out.current / CANDLES, duration: 0.4 });

    if (out.current === CANDLES) {
      mic.stop();
      stopHold();
      gsap.delayedCall(1.2, onDone); // let the last smoke finish first
    }
  });

  const feed = (amount) => {
    if (out.current >= CANDLES || !meter.current) return;
    energy.current = Math.min(1, energy.current + amount);
    meter.current.style.width = energy.current * 100 + "%";

    if (energy.current >= 1) {
      energy.current = 0;
      meter.current.style.width = "0%";
      killOne();
    }
  };

  // hold-to-blow fallback
  const startHold = (e) => {
    e.preventDefault();
    if (holdTimer.current) return;
    holdTimer.current = setInterval(() => feed(0.07), 50);
  };
  const stopHold = () => {
    clearInterval(holdTimer.current);
    holdTimer.current = null;
  };
  useEffect(() => stopHold, []);

  return (
    <div className="scene" ref={root}>
      <div className="cake-wrap">
        <div className="cake">
          <div className="glow" />
          <div className="plate" />
          <div className="layer l1" />
          <div className="layer l2" />
          <div className="layer l3" />
          <div className="candles">
            {Array.from({ length: CANDLES }, (_, i) => (
              <div className="candle" key={i}>
                <div className="flame" ref={(el) => (flames.current[i] = el)} />
                <div className="smoke" ref={(el) => (smokes.current[i] = el)} />
              </div>
            ))}
          </div>
        </div>

        <div className="blow-ui">
          <h2>Blow out the candles</h2>
          <p>{MESSAGES[mic.status]}</p>
          <div className="meter">
            <i ref={meter} />
          </div>

          {mic.status === "idle" && (
            <button className="hold" onClick={mic.start}>
              start
            </button>
          )}

          <button
            className="hold"
            onPointerDown={startHold}
            onPointerUp={stopHold}
            onPointerLeave={stopHold}
            onPointerCancel={stopHold}
            onContextMenu={(e) => e.preventDefault()}
          >
            or hold here to blow
          </button>
        </div>
      </div>
    </div>
  );
}