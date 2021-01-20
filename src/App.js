// hooks and libs
import React, { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
// lib components
import { Alert, Button, Select, Switch } from "antd";
// custom components
import GameEditor from "./components/game-editor/game-editor";
import MathQuillEditor from "./components/tex-editor/tex-editor";
// utils
import { checkTex, convertMathInput } from "./utils/kotlin-lib-functions";
// styles
import "antd/dist/antd.compact.min.css";
import "./App.scss";

const { Option } = Select;

function App() {
  const history = useHistory();
  // getting url query params
  const {
    mode: modeUrl,
    originalExpression: originalExpressionUrl,
    endExpression: endExpressionUrl,
    rulePack: rulePackUrl,
    hideDetails: hideDetailsUrl,
    correctSolution: correctSolutionUrl,
  } = Object.fromEntries(
    useLocation()
      .search.slice(1)
      .split("&")
      .map((queryStr) => {
        return queryStr.split("=");
      })
  );
  // local utils
  const rerenderTexSolutionInput = async () => {
    await setTexSolutionRerendered(false);
    await setTexSolutionRerendered(true);
  };
  const formSolutionStartingTex = () => {
    return startTex + "=...=" + endTex;
  };
  const reverseGameMode = async () => {
    await setIsGameMode((prevState) => !prevState);
    await setIsGameMode((prevState) => !prevState);
  };
  // data
  const defaultStart = originalExpressionUrl
    ? originalExpressionUrl
    : "(and(a;or(a;b)))";
  const defaultEnd = endExpressionUrl ? endExpressionUrl : "(a)";
  const rulePacks = [
    "Logic",
    "ShortMultiplication",
    "Logarithm",
    "Trigonometry",
  ];
  // demo task deps
  const [startSS, setStartSS] = useState(defaultStart);
  const [endSS, setEndSS] = useState(defaultEnd);
  const [currentRulePack, setCurrentRulePack] = useState(
    rulePackUrl && rulePacks.includes(rulePackUrl) ? rulePackUrl : "Logic"
  );
  const [hideDetails, setHideDetails] = useState(
    hideDetailsUrl !== undefined ? hideDetailsUrl === "true" : false
  );
  const [correctSolution, setCorrectSolution] = useState(
    correctSolutionUrl ? correctSolutionUrl : null
  );
  // app deps
  const [startTex, setStartTex] = useState(
    convertMathInput("STRUCTURE_STRING", "TEX", defaultStart)
  );
  const [endTex, setEndTex] = useState(
    convertMathInput("STRUCTURE_STRING", "TEX", defaultEnd)
  );
  const [isGameMode, setIsGameMode] = useState(!modeUrl || modeUrl === "play");
  const [texSolutionRerendered, setTexSolutionRerendered] = useState(true);
  const [solutionInTex, setSolutionInTex] = useState("");
  const [solutionStartingTex, setSolutionStartingTex] = useState(
    formSolutionStartingTex()
  );
  // errors
  const [startError, setStartError] = useState(null);
  const [endError, setEndError] = useState(null);
  const [solutionError, setSolutionError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  // user actions
  const onCreateTask = async () => {
    // making local vars to have scope outside "try catch" block
    let isError = false;
    let startSSConverted;
    let endSSConverted;
    try {
      startSSConverted = convertMathInput("TEX", "STRUCTURE_STRING", startTex);
      setStartSS(startSSConverted);
    } catch (e) {
      setStartError(e.message);
      isError = true;
    }
    try {
      endSSConverted = convertMathInput("TEX", "STRUCTURE_STRING", endTex);
      setEndSS(endSSConverted);
    } catch (e) {
      setEndError(e.message);
      isError = true;
    }
    if (!isError) {
      history.push(
        `/?` +
          `modeUrl=${isGameMode ? "play" : "solve"}` +
          `&originalExpression=${startSSConverted}` +
          `&endExpression=${endSSConverted}` +
          `&rulePack=${currentRulePack}` +
          `&hideDetails=${hideDetails}` +
          `&correctSolution=${correctSolution ? correctSolution : ""}`
      );
      setStartError(null);
      setEndError(null);
      setSuccessMsg(null);
      setSolutionError(null);
      setSolutionStartingTex(formSolutionStartingTex());
      await reverseGameMode();
      await rerenderTexSolutionInput();
    }
  };
  const onCheckTexSolutionInput = async () => {
    const res = checkTex(solutionInTex, startSS, endSS, [currentRulePack]);
    if (res.errorMessage) {
      setSuccessMsg(null);
      setSolutionError(res.errorMessage);
    } else {
      setSolutionError(null);
      setSuccessMsg("Congratulations! Correct solution!");
    }
    setSolutionStartingTex(res.validatedSolution);
    await rerenderTexSolutionInput();
  };

  return (
    <div className="app">
      <div className="app__inputs">
        <div className="app__tex-inputs">
          <div className="app__tex-input">
            <h2>Prove that</h2>
            <MathQuillEditor
              showOperationTab={false}
              startingLatexExpression={startTex}
              width={window.innerWidth / 20}
              updateValue={(value) => {
                setStartTex(value);
              }}
            />
          </div>
          <div className="app__tex-input">
            <h2>equals</h2>
            <MathQuillEditor
              showOperationTab={false}
              startingLatexExpression={endTex}
              width={window.innerWidth / 20}
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
              defaultValue={currentRulePack}
              onChange={(value) => {
                setCurrentRulePack(value);
              }}
              style={{ width: "150px" }}
            >
              {rulePacks.map((option) => (
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
          <Button onClick={onCreateTask}>Change Task!</Button>
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
        <GameEditor start={startSS} end={endSS} rulePacks={currentRulePack} />
      )}
      {!isGameMode && texSolutionRerendered && (
        <div className="app__tex-solution-block">
          <h1>Write solution instead of dots</h1>
          <MathQuillEditor
            startingLatexExpression={solutionStartingTex}
            updateValue={(value) => {
              setSolutionInTex(value);
            }}
            big={true}
            width={"600px"}
          />
          {(successMsg || solutionError) && (
            <Alert
              message={solutionError ? solutionError : successMsg}
              className="alert-msg"
              type={solutionError ? "error" : "success"}
              style={{ marginRight: "0" }}
            />
          )}
          <Button
            onClick={onCheckTexSolutionInput}
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
