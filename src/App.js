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
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const [
    currentMathFieldSelectOption,
    setCurrentMathFieldSelectOption,
  ] = useState("Logic");
  // app deps
  const [startInput, setStartInput] = useState(defaultStart);
  const [endInput, setEndInput] = useState(defaultEnd);
  const [isGameMode, setIsGameMode] = useState(true);
  // errors
  const [startError, setStartError] = useState(null);
  const [endError, setEndError] = useState(null);

  return (
    <div className="app">
      <GameEditor
        start={start}
        end={end}
        rulePacks={currentMathFieldSelectOption}
      />
      <div className="app__inputs">
        <div className="app__input-group">
          <label>Start</label>
          <MathQuillEditor
            startingLatexExpression={convertMathInput(
              "STRUCTURE_STRING",
              "TEX",
              defaultStart
            )}
            width="300px"
            updateValue={(value) => {
              try {
                setStartInput(
                  convertMathInput("TEX", "STRUCTURE_STRING", value)
                );
                setStartError(null);
              } catch (e) {
                setStartError(e.message);
              }
            }}
          />
          {startError && (
            <Alert
              message={startError}
              type="error"
              style={{ maxWidth: "300px", marginTop: "15px" }}
            />
          )}
        </div>
        <div className="app__input-group">
          <label>End</label>
          <MathQuillEditor
            startingLatexExpression={convertMathInput(
              "STRUCTURE_STRING",
              "TEX",
              endInput
            )}
            width="300px"
            updateValue={(value) => {
              try {
                setEndInput(convertMathInput("TEX", "STRUCTURE_STRING", value));
                setEndError(null);
              } catch (e) {
                setEndError(e.message);
              }
            }}
          />
          {endError && (
            <Alert
              message={endError}
              type="error"
              style={{ maxWidth: "300px", marginTop: "15px" }}
            />
          )}
        </div>
        <div className="app__input-group">
          <label>Math Field</label>
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
          onClick={() => {
            setStart(startInput);
            setEnd(endInput);
          }}
        >
          Create task!
        </Button>
      </div>
    </div>
  );
}

export default App;
