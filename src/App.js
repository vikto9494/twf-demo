import React, { useState } from "react";

import GameEditor from "./components/game-editor/game-editor";

function App() {
  const [start, setStart] = useState("(and(a;or(a;b)))");
  const [end, setEnd] = useState("(a)");
  const [startInput, setStartInput] = useState("(and(a;or(a;b)))");
  const [endInput, setEndInput] = useState("(a)");

  return (
    <div className="App">
      <input
        type="text"
        value={startInput}
        onChange={(e) => {
          setStartInput(e.currentTarget.value);
        }}
      />
      <input
        type="text"
        value={endInput}
        onChange={(e) => {
          setEndInput(e.currentTarget.value);
        }}
      />
      <button
        onClick={() => {
          setStart(startInput);
          setEnd(endInput);
        }}
      >
        Создать
      </button>
      <GameEditor start={start} end={end} />
    </div>
  );
}

export default App;
