import { useState } from "react";
import Terminal from "./Terminal";
import Cake from "./Cake";
import Lights from "./Lights";
import Story from "./Story";
import Epilogue from "./Epilogue";

const PHASES = ["terminal", "cake", "lights", "story", "epilogue"];

export default function App() {
  const[phase, setPhase] = useState("terminal");

  const next = () => {
    const i = PHASES.indexOf(phase);
    if(i< PHASES.length-1) setPhase(PHASES[i+1]);
  }

  return (
    <main className="{`stage phase-{phase}`}">
      {phase === "terminal" && <Terminal onDone={next}/>}
      {phase === "cake" && <Cake onDone={next}/>}
      {phase === "lights" && <Lights onDone={next}/>}
      {phase === "story" && <Story onDone={next}/>}
      {phase === "epilogue" && <Epilogue onDone={next}/>}
    </main>
  );
}