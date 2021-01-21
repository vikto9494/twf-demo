import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import { checkTex, convertMathInput, checkTexWithoutCompiledConfigurationCreating, createConfigurationFromRulePacksAndDetailSolutionCheckingParams } from "../utils/kotlin-lib-functions";
import MathQuillEditor from "../components/tex-editor/tex-editor";
import { Alert, Button, Select, Switch } from "antd";
import GameEditor from "../components/game-editor/game-editor";
import { useState } from "react";
import "./main-page.scss";

const { Option } = Select;

const MainPage = () => {
  const history = useHistory();
  // getting url query params
  const {
    mode: modeUrl,
    originalExpression: originalExpressionUrl,
    endExpression: endExpressionUrl,
    rulePack: rulePackUrl,
    hideDetails: hideDetailsUrl,
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
  const [compiledConfiguration, setCompiledConfiguration] = useState(createConfigurationFromRulePacksAndDetailSolutionCheckingParams(currentRulePack));
  const [hideDetails, setHideDetails] = useState(
    hideDetailsUrl !== undefined ? hideDetailsUrl === "true" : false
  );
  const [correctSolution, setCorrectSolution] = useState(
    startSS === "(+(3;*(4;cos(*(2;x)));cos(*(4;x))))" &&
      endSS === "(*(8;^(cos(x);4)))" &&
      currentRulePack === "Trigonometry"
      ? "3+4\\cdot \\cos \\left(2\\cdot x\\right)+\\cos \\left(4\\cdot x\\right)=3+4\\cdot \\left(2\\cdot \\cos ^2\\left(x\\right)-1\\right)+\\left(2\\cdot \\cos ^2\\left(2\\cdot x\\right)-1\\right)=3+4\\cdot \\left(2\\cdot \\cos ^2\\left(x\\right)-1\\right)+2\\cdot \\left(2\\cdot \\cos ^2\\left(x\\right)-1\\right)^2-1=8\\cdot \\cos \\left(x\\right)^4"
      : null
  );
  // app deps
  const [startTex, setStartTex] = useState(
    convertMathInput("STRUCTURE_STRING", "TEX", defaultStart)
  );
  const [endTex, setEndTex] = useState(
    convertMathInput("STRUCTURE_STRING", "TEX", defaultEnd)
  );
  console.log(!modeUrl || modeUrl === "play");
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
          `mode=${isGameMode ? "play" : "solve"}` +
          `&originalExpression=${startSSConverted}` +
          `&endExpression=${endSSConverted}` +
          `&rulePack=${currentRulePack}` +
          `&hideDetails=${hideDetails}`
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
    const res = checkTexWithoutCompiledConfigurationCreating(solutionInTex, startSS, endSS, compiledConfiguration);
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
  const createDefaultAndDisabledClassName = (className) => {
    if (hideDetails) {
      return `${className} ${className}--disabled`;
    } else {
      return className;
    }
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
              width={hideDetailsUrl ? undefined : "22rem"}
              updateValue={(value) => {
                setStartTex(value);
              }}
              disable={hideDetailsUrl}
            />
          </div>
          <div className={createDefaultAndDisabledClassName("app__tex-input")}>
            <h2>equals</h2>
            <MathQuillEditor
              showOperationTab={false}
              startingLatexExpression={endTex}
              width={hideDetailsUrl ? undefined : "22rem"}
              updateValue={(value) => {
                setEndTex(value);
              }}
              disable={hideDetailsUrl}
            />
          </div>
        </div>
        <div className={createDefaultAndDisabledClassName("app__add-inputs")}>
          {!hideDetails && (
            <div className="app__input-group">
              <label>Subject Area</label>
              <Select
                defaultValue={currentRulePack}
                onChange={(value) => {
                  setCurrentRulePack(value);
                  setCompiledConfiguration();
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
          )}
          <div className="app__input-group">
            <label>Game mode</label>
            <Switch
              checked={isGameMode}
              onChange={(value) => {
                setIsGameMode(value);
              }}
            />
          </div>
          {!hideDetails && <Button onClick={onCreateTask}>Change Task!</Button>}
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
            width={window.innerWidth - 100 + "px"}
          />
          {(successMsg || solutionError) && (
            <Alert
              message={solutionError ? solutionError : successMsg}
              className="alert-msg"
              type={solutionError ? "error" : "success"}
              style={{ marginRight: "0" }}
            />
          )}
          <div className="app__tex-solution-btns">
            <Button
              onClick={onCheckTexSolutionInput}
              style={{
                marginTop: "10px",
              }}
              type="primary"
            >
              Check
            </Button>
            {correctSolution && (
              <Button
                onClick={async () => {
                  if (correctSolution) {
                    await setSolutionStartingTex(correctSolution);
                    await rerenderTexSolutionInput();
                  }
                }}
                style={{
                  marginTop: "10px",
                }}
                type="success"
              >
                Get correct solution
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;
