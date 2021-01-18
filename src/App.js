// hooks and libs
import React, { useState } from "react";
// lib components
import { Alert, Button, Select, Switch } from "antd";
// custom components
import GameEditor from "./components/game-editor/game-editor";
import MathQuillEditor from "./components/tex-editor/tex-editor";
// utils
import { convertMathInput } from "./utils/kotlin-lib-functions";
// styles
import "antd/dist/antd.compact.min.css";
import "./App.scss";

const { Option } = Select;

function App() {
  // data
  const defaultStart = "(and(a;or(a;b)))";
  const defaultEnd = "(a)";
  const mathFieldSelectOptions = [
    "Logic",
    "ShortMultiplication",
    "Logarithm",
    "Trigonometry",
  ];
  // demo task deps
  const [startSS, setStartSS] = useState(defaultStart);
  const [endSS, setEndSS] = useState(defaultEnd);
  const [
    currentMathFieldSelectOption,
    setCurrentMathFieldSelectOption,
  ] = useState("Logic");
  // app deps
  const [startTex, setStartTex] = useState(
    convertMathInput("STRUCTURE_STRING", "TEX", defaultStart)
  );
  const [endTex, setEndTex] = useState(
    convertMathInput("STRUCTURE_STRING", "TEX", defaultEnd)
  );
  const [isGameMode, setIsGameMode] = useState(true);
  const [texSolutionRerendered, setTexSolutionRerendered] = useState(true);
  // errors
  const [startError, setStartError] = useState(null);
  const [endError, setEndError] = useState(null);
  // local utils
  const rerenderTexSolutionInput = async () => {
    await setTexSolutionRerendered(false);
    await setTexSolutionRerendered(true);
  };

  return (
    <div className="app">
      <div className="app__inputs">
        <div className="app__tex-inputs">
          <div className="app__tex-input">
            <label>Start</label>
            <MathQuillEditor
              startingLatexExpression={startTex}
              width={window.innerWidth >= 600 ? "300px" : "250px"}
              updateValue={(value) => {
                setStartTex(value);
              }}
            />
          </div>
          <div className="app__tex-input">
            <label>Target</label>
            <MathQuillEditor
              startingLatexExpression={endTex}
              width={window.innerWidth >= 600 ? "300px" : "250px"}
              updateValue={(value) => {
                setEndTex(value);
              }}
            />
          </div>
        </div>
        <div className="app__add-inputs">
          <div className="app__input-group">
            <label>Subject Area</label>
            <Select
              defaultValue={mathFieldSelectOptions[0]}
              onChange={(value) => {
                setCurrentMathFieldSelectOption(value);
              }}
              style={{ width: "150px" }}
            >
              {mathFieldSelectOptions.map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </div>
          <div className="app__input-group">
            <label>Game mode</label>
            <Switch
              checked={isGameMode}
              onChange={(value) => {
                setIsGameMode(value);
              }}
            />
          </div>
          <Button
            onClick={async () => {
              try {
                setStartSS(
                  startTex !== ""
                    ? convertMathInput("TEX", "STRUCTURE_STRING", startTex)
                    : "()"
                );
                setStartError(null);
              } catch (e) {
                setStartError(e.message);
              }
              try {
                setEndSS(
                  endTex !== ""
                    ? convertMathInput("TEX", "STRUCTURE_STRING", endTex)
                    : "()"
                );
                setEndError(null);
              } catch (e) {
                setEndError(e.message);
              }
              if (!startError && !endError) {
                await rerenderTexSolutionInput();
              }
            }}
          >
            Change Task!
          </Button>
        </div>
      </div>
      <div className="app__errors">
        {startError && (
          <Alert
            message={"Error in start expression! " + startError}
            className="alert-msg"
            type="error"
          />
        )}
        {endError && (
          <Alert
            message={"Error in target expression! " + endError}
            className="alert-msg"
            type="error"
          />
        )}
      </div>
      {isGameMode && (
        <GameEditor
          start={startSS}
          end={endSS}
          rulePacks={currentMathFieldSelectOption}
        />
      )}
      {!isGameMode && texSolutionRerendered && (
        <div className="app__tex-solution-block">
          <h1>Your Solution</h1>
          <MathQuillEditor
            startingLatexExpression={startTex + "=...=" + endTex}
          />
          <Button
            style={{
              marginTop: "10px",
            }}
          >
            Check
          </Button>
        </div>
      )}
    </div>
  );
}

export default App;
