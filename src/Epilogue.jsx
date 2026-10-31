import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const PEANUTS = 26;

export default function Epilogue() {
  const root = useRef(null);
  const bag = useRef(null);
  const [opened, setOpened] = useState(false);

  // title, then the packet, rise in
  const { contextSafe } = useGSAP(
    () => {
      gsap.from(".epi-title", { y: 16, opacity: 0, duration: 0.9 });
      gsap.from(".packet", { y: 30, opacity: 0, duration: 0.9, delay: 0.5 });
    },
    { scope: root }
  );

  const open = contextSafe(() => {
    if (opened) return;
    setOpened(true);

    // the top flap folds back
    gsap.to(".bag-top", { rotationX: -150, transformPerspective: 400, duration: 0.6, ease: "power2.in" });

    // put every peanut at the mouth of the bag…
    const r = bag.current.getBoundingClientRect();
    gsap.set(".peanut", { left: r.left + r.width / 2, top: r.top + 20, x: 0, y: 0, opacity: 1 });

    // …then throw them up and let them fall
    gsap.timeline()
      .to(".peanut", {
        x: "random(-150, 150)",
        y: "random(-300, -80)",
        rotation: "random(0, 720)",
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.02,
      })
      .to(".peanut", { y: "+=420", opacity: 0, duration: 1, ease: "power1.in", stagger: 0.02 }, "-=0.3");

    // the note inside appears
    gsap.to(".bag-msg", { opacity: 1, duration: 0.6, delay: 0.5 });
  });

  return (
    <div className="epi" ref={root}>
      <div>
        <div className="epi-title">
          <h1>happy<br />birthday,<br /><em>Jaskirat</em></h1>
          <p>build succeeded · 0 errors · 1 legend</p>
        </div>

        <div
          className="packet"
          role="button"
          tabIndex={0}
          onClick={open}
          onKeyDown={(e) => e.key === "Enter" && open()}
        >
          <div className="bag" ref={bag}>
            <div className="bag-top" />
            <div className="bag-msg">
              one more thing:<br />the next ten packets are on me.<br />no arguments.
            </div>
            <div className="bag-label">
              masala<br />peanuts
              <span>LIMITED BIRTHDAY EDITION</span>
            </div>
          </div>
          <p className="packet-hint">{opened ? "\u00A0" : "tap to open"}</p>
        </div>

        {Array.from({ length: PEANUTS }, (_, i) => (
          <div className="peanut" key={i} style={{ opacity: 0 }} />
        ))}
      </div>
    </div>
  );
}