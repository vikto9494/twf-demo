// hooks and libs
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
// lib components
import { Alert, Button, Select, Switch } from "antd";
import ClipLoader from "react-spinners/ClipLoader";
import { EditableMathField, StaticMathField } from "react-mathquill";
// custom components
import GameEditor from "../components/game-editor/game-editor";
// utils
import { convertMathInput, checkTex } from "../utils/kotlin-lib-functions";
import { addStyles } from "react-mathquill";
// icons
import sumIcon from "../assets/math-symbols/sum.svg";
import squareIcon from "../assets/math-symbols/square-root.svg";
import piIcon from "../assets/math-symbols/pi.svg";
// styles
import "./main-page.scss";
// inserts the required mathquill css to the <head> block.
addStyles();

const MainPage = () => {
  const { Option } = Select;
  // getting url query params
  const history = useHistory();
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
  const formSolutionStartingTex = () => {
    return startTex + "=...=" + endTex;
  };
  const reverseGameMode = () => {
    setIsGameMode((prevState) => !prevState);
    setIsGameMode((prevState) => !prevState);
  };
  const createDefaultAndDisabledClassName = (className) => {
    if (hideDetails) {
      return `${className} ${className}--disabled`;
    } else {
      return className;
    }
  };
  // static data
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
  // app dependencies
  const [startSS, setStartSS] = useState(defaultStart);
  const [endSS, setEndSS] = useState(defaultEnd);
  const [currentRulePack, setCurrentRulePack] = useState(
    rulePackUrl && rulePacks.includes(rulePackUrl) ? rulePackUrl : "Logic"
  );
  const hideDetails =
    hideDetailsUrl !== undefined ? hideDetailsUrl === "true" : false;
  const correctSolution =
    startSS === "(+(3;*(4;cos(*(2;x)));cos(*(4;x))))" &&
    endSS === "(*(8;^(cos(x);4)))" &&
    currentRulePack === "Trigonometry"
      ? "3+4\\cdot \\cos \\left(2\\cdot x\\right)+\\cos \\left(4\\cdot x\\right)=3+4\\cdot \\left(2\\cdot \\cos ^2\\left(x\\right)-1\\right)+\\left(2\\cdot \\cos ^2\\left(2\\cdot x\\right)-1\\right)=3+4\\cdot \\left(2\\cdot \\cos ^2\\left(x\\right)-1\\right)+2\\cdot \\left(2\\cdot \\cos ^2\\left(x\\right)-1\\right)^2-1=8\\cdot \\cos \\left(x\\right)^4"
      : null;
  const [startTex, setStartTex] = useState(
    convertMathInput("STRUCTURE_STRING", "TEX", defaultStart)
  );
  const [endTex, setEndTex] = useState(
    convertMathInput("STRUCTURE_STRING", "TEX", defaultEnd)
  );
  const [isGameMode, setIsGameMode] = useState(!modeUrl || modeUrl === "play");
  const [solutionInTex, setSolutionInTex] = useState(formSolutionStartingTex());
  const [showSpinner, setShowSpinner] = useState(false);
  // input check messages
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
      setSolutionInTex(formSolutionStartingTex());
      reverseGameMode();
    }
  };

  const onCheckTexSolutionInput = () => {
    const res = checkTex(solutionInTex, startSS, endSS, [currentRulePack]);
    if (res.errorMessage) {
      setSuccessMsg(null);
      setSolutionError(res.errorMessage);
    } else {
      setSolutionError(null);
      setSuccessMsg("Congratulations! Correct solution!");
    }
    setSolutionInTex(res.validatedSolution);
  };

  useEffect(() => {
    if (showSpinner) {
      onCheckTexSolutionInput();
      setShowSpinner(false);
    }
  }, [showSpinner]);

  // tex solution commands
  const [solutionMathField, setSolutionMathField] = useState(null);
  const actions = [
    {
      iconUrl: sumIcon,
      latexCmd: () => {
        if (solutionMathField) {
          solutionMathField.cmd("\\sum");
        }
      },
    },
    {
      iconUrl: squareIcon,
      latexCmd: () => {
        if (solutionMathField) {
          solutionMathField.cmd("\\sqrt");
        }
      },
    },
    {
      iconUrl: piIcon,
      latexCmd: () => {
        if (solutionMathField) {
          solutionMathField.cmd("\\pi");
        }
      },
    },
    // TODO: find icons and finish
    // {
    //   iconUrl: andIcon,
    //   latexCmd: "\\land",
    // },
    // {
    //   iconUrl: orIcon,
    //   latexCmd: "\\lor",
    // },
    // {
    //   iconUrl: oplusIcon,
    //   latexCmd: "\\oplus",
    // },
    // {
    //   iconUrl: negIcon,
    //   latexCmd: "\\neg",
    // },
    // {
    //   iconUrl: impliesIcon,
    //   latexCmd: "\\implies",
    // },
    // {
    //   iconUrl: setminusIcon,
    //   latexCmd: "\\setminus",
    // },
  ];

  return (
    <div className="app">
      <div className="app__inputs">
        <div className={createDefaultAndDisabledClassName("app__tex-inputs")}>
          <div className={createDefaultAndDisabledClassName("app__tex-input")}>
            <h2>Prove that</h2>
            {!hideDetails ? (
              <EditableMathField
                latex={startTex}
                onChange={(mathField) => {
                  setStartTex(mathField.latex());
                }}
                style={{
                  width: "22rem",
                  fontSize: "1.6rem",
                }}
              />
            ) : (
              <StaticMathField
                style={{
                  fontSize: "2.2rem",
                }}
              >
                {startTex}
              </StaticMathField>
            )}
          </div>
          <div className={createDefaultAndDisabledClassName("app__tex-input")}>
            <h2>equals</h2>
            {!hideDetails ? (
              <EditableMathField
                latex={endTex}
                onChange={(mathField) => {
                  setEndTex(mathField.latex());
                }}
                style={{
                  width: "22rem",
                  fontSize: "1.6rem",
                }}
              />
            ) : (
              <StaticMathField
                style={{
                  fontSize: "2.2rem",
                }}
              >
                {endTex}
              </StaticMathField>
            )}
          </div>
        </div>
        {!hideDetails && (
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
        )}
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
      {!isGameMode && (
        <div className="app__tex-solution-block">
          <h1>Write solution instead of dots</h1>
          <div className="tex-solution">
            <div className="tex-solution__operations">
              {actions.map((action, i) => {
                const { iconUrl, latexCmd } = action;
                return (
                  <div key={i} className="tex-solution__operation">
                    <img src={iconUrl} onClick={() => latexCmd()} />
                  </div>
                );
              })}
            </div>
            <EditableMathField
              latex={solutionInTex}
              mathquillDidMount={(mathField) => setSolutionMathField(mathField)}
              onChange={(mathField) => {
                setSolutionInTex(mathField.latex());
              }}
              style={{
                minWidth: "40rem",
                maxWidth: window.innerWidth - 100 + "px",
                fontSize: "2.2rem",
              }}
            />
          </div>
          <ClipLoader loading={showSpinner} />
          {(successMsg || solutionError) && (
            <Alert
              message={solutionError ? solutionError : successMsg}
              className="alert-msg"
              type={solutionError ? "error" : "success"}
              style={{ marginTop: "1rem" }}
            />
          )}
          <div className="app__tex-solution-btns">
            <Button
              onClick={() => {
                // callback is provided in useEffect
                setShowSpinner(true);
              }}
              style={{
                marginTop: "1rem",
              }}
              type="primary"
            >
              Check
            </Button>
            {correctSolution && (
              <Button
                onClick={() => {
                  setSolutionInTex(correctSolution);
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
