import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

// [style, text] — style is a class from index.css: "", "dim", "gold", "warn"
// "bar" is special: it draws the loading bar instead of typing text
const SCRIPT = [
  ["dim", "jaskirat@birthday ~ %"],
  ["", "./happy_birthday.exe --user jaskirat"],
  ["dim", "booting… v26.0.0"],
  ["", "npm install jaskirat@26"],
  ["dim", "  added 1 legend in 0.3s"],
  ["", "loading masala_peanuts.json"],
  ["bar", ""],
  ["gold", "  ✓ 100% — crunchy, spicy, non-negotiable"],
  ["", "checking cake.status"],
  ["warn", "  WARNING: 5 candles still lit"],
  ["warn", "  action required ⟶ user must blow"],
  ["dim", "crashing to cake in 3… 2… 1…"],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// swap the last item of an array for a new one (used while a line is typing)
const replaceLast = (arr, item) => [...arr.slice(0, -1), item];

export default function Terminal({ onDone }) {
  const [lines, setLines] = useState([]); // [{ cls, text }]
  const termRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let tl;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    async function run() {
      for (const [cls, text] of SCRIPT) {
        if (cancelled) return;

        // loading bar: grows from 0% to 100%
        if (cls === "bar") {
          const total = 22;
          setLines((prev) => [...prev, { cls: "", text: "" }]);
          for (let k = 0; k <= total; k++) {
            if (cancelled) return;
            const bar =
              "  " + "█".repeat(k) + "░".repeat(total - k) +
              " " + Math.round((k / total) * 100) + "%";
            setLines((prev) => replaceLast(prev, { cls: "", text: bar }));
            await sleep(reduced ? 5 : 45);
          }
          continue;
        }

        // normal line: add an empty line, then type it one letter at a time
        setLines((prev) => [...prev, { cls, text: "" }]);
        for (let c = 1; c <= text.length; c++) {
          if (cancelled) return;
          setLines((prev) => replaceLast(prev, { cls, text: text.slice(0, c) }));
          // commands type slower than output, like a person vs a computer
          await sleep(reduced ? 2 : cls === "" ? 38 : 14);
        }
        await sleep(cls === "warn" ? 500 : 220);
      }

      await sleep(900);
      if (cancelled) return;

      // glitch shake, then fade out and hand over to the cake
      tl = gsap.timeline({ onComplete: () => !cancelled && onDone() });
      tl.to(termRef.current, { x: -6, skewX: 8, duration: 0.06, repeat: 5, yoyo: true })
        .to(termRef.current, { x: 0, skewX: 0, opacity: 0, duration: 0.3 });
    }

    run();

    return () => {
      cancelled = true;
      tl?.kill();
    };
  }, []);

  return (
    <div className="scene">
      <div className="term" ref={termRef}>
        {lines.map((line, i) => (
          <div key={i} className={`line ${line.cls}`}>
            {line.text}
            {i === lines.length - 1 && <span className="cursor" />}
          </div>
        ))}
      </div>
    </div>
  );
}