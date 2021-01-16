import React, { useState } from "react";

import GameEditor from "./components/game-editor/game-editor";

function App() {
  const [start, setStart] = useState("(+(2;2))");
  const [end, setEnd] = useState("(4)");
  const [startInput, setStartInput] = useState("(+(2;2))");
  const [endInput, setEndInput] = useState("(4)");

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
