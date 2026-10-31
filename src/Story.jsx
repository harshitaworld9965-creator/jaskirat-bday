import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/* ------------------------------------------------------------------
   THE STORY — edit words here, nothing else needs to change.
   label:   small text at the top
   vis:     the little drawing above the words
   lines:   appear one by one; small: true = the grey mono aside
   animate: extra motion for the drawing (optional)
------------------------------------------------------------------- */
const CHAPTERS = [
  {
    label: "chapter one · how it started",
    vis: (
      <div>
        <span className="glass g-mine"><i /></span>
        <span className="glass"><i /></span>
      </div>
    ),
    lines: [
      { text: "We met at a party." },
      { text: "I offered you a drink." },
      { text: <>You said <em>no thanks, I don’t drink.</em></> },
    ],
    animate: (tl) => tl.to(".g-mine", { "--fill": "26px", duration: 1 }, 0.6),
  },
  {
    label: "chapter one · continued",
    vis: (
      <div>
        <span className="glass" style={{ "--fill": "26px" }}><i /></span>
        <span className="glass g-his"><i /></span>
      </div>
    ),
    lines: [
      { text: "That didn’t last." },
      { text: "You now out-drink me." },
      { text: "I take full responsibility.", small: true },
    ],
    animate: (tl) => tl.to(".g-his", { "--fill": "30px", duration: 1.2 }, 1.4),
  },
  {
    label: "chapter two · the long day",
    vis: (
      <div className="bottles">
        <div className="bottle" /><div className="bottle" /><div className="bottle" />
        <div className="can" /><div className="can" /><div className="can" />
      </div>
    ),
    lines: [
      { text: "Three bottles of wine." },
      { text: "A number of beers we stopped counting." },
      { text: "A whole day of going nowhere in particular, together." },
    ],
    animate: (tl) =>
      tl.fromTo(".bottle, .can", { opacity: 0, y: 12 }, { opacity: 1, y: 0, stagger: 0.15, duration: 0.5 }, 0.4),
  },
  {
    label: "chapter three · the incident",
    vis: (
      <div className="chat">
        <div className="bub me">so anyway, the thing is—</div>
        <div className="bub me">and I just… I don’t know, I—</div>
        <div className="bub him">you want masala peanuts?</div>
      </div>
    ),
    lines: [
      { text: "I was telling you something that mattered." },
      { text: "I was about to cry." },
      { text: "I have never laughed harder in my life.", small: true },
    ],
    animate: (tl) =>
      tl.fromTo(".bub", { opacity: 0, y: 8 }, { opacity: 1, y: 0, stagger: 1.1, duration: 0.5 }, 0.4),
  },
  {
    label: "chapter four · today",
    vis: (
      <div className="candle" style={{ height: 60 }}>
        <div className="flame" />
      </div>
    ),
    lines: [
      { text: "Thanks for being around." },
      { text: "Even when I’m a huge asshole." },
      { text: <><em>Especially</em> then.</> },
    ],
    animate: (tl) => tl.from(".flame", { scale: 0, opacity: 0, duration: 0.8, ease: "back.out(2)" }, 0.3),
  },
];

/* ---------------- one chapter on screen ---------------- */
function Chapter({ chapter, onNext }) {
  const root = useRef(null);
  const tl = useRef(null);
  const ready = useRef(false);
  const leaving = useRef(false);

  const { contextSafe } = useGSAP(
    () => {
      const t = gsap.timeline();
      t.from(root.current, { opacity: 0, duration: 0.5 })
        .fromTo(
          ".lines p",
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, stagger: 1.3, duration: 0.8, ease: "power2.out" },
          0.3
        );
      chapter.animate?.(t);
      t.to(".tap", { opacity: 0.6, duration: 0.6 }, "+=0.4")
        .call(() => (ready.current = true));
      tl.current = t;
    },
    { scope: root }
  );

  const handleTap = contextSafe(() => {
    // first tap while text is still appearing: show everything now
    if (!ready.current) {
      tl.current.progress(1);
      return;
    }
    // second tap: fade out and go to the next chapter
    if (leaving.current) return;
    leaving.current = true;
    gsap.to(root.current, { opacity: 0, duration: 0.4, onComplete: onNext });
  });

  return (
    <div className="story" ref={root} onClick={handleTap}>
      <div className="chap">{chapter.label}</div>
      <div className="story-body">
        <div className="vis">{chapter.vis}</div>
        <div className="lines">
          {chapter.lines.map((line, i) => (
            <p key={i} className={line.small ? "small" : ""}>{line.text}</p>
          ))}
        </div>
      </div>
      <div className="tap"><i />tap to continue</div>
    </div>
  );
}

/* ---------------- the whole story ---------------- */
export default function Story({ onDone }) {
  const [index, setIndex] = useState(0);
  const sky = useRef(null);

  // gold flecks drifting down behind every chapter
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = sky.current;

    const fleck = () => {
      const f = document.createElement("div");
      f.className = "fleck";
      f.style.left = Math.random() * 100 + "%";
      box.appendChild(f);
      gsap.to(f, {
        y: window.innerHeight + 40,
        x: `+=${Math.random() * 60 - 30}`,
        opacity: 0,
        duration: 8 + Math.random() * 6,
        ease: "none",
        onComplete: () => f.remove(),
      });
    };

    fleck();
    const id = setInterval(fleck, 1600);
    return () => {
      clearInterval(id);
      gsap.killTweensOf([...box.children]);
      box.innerHTML = "";
    };
  }, []);

  const next = () => {
    if (index < CHAPTERS.length - 1) setIndex(index + 1);
    else onDone();
  };

  return (
    <>
      <div ref={sky} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
      <Chapter key={index} chapter={CHAPTERS[index]} onNext={next} />
    </>
  );
}