// hooks and libs
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
// lib components
import { Alert, Button, Select, Tooltip } from "antd";
import ClipLoader from "react-spinners/ClipLoader";
import { EditableMathField, StaticMathField } from "react-mathquill";
// custom components
import GameEditor from "../components/game-editor/game-editor";
// utils
import {
  convertMathInput,
  checkTex,
  generateTasks,
  decodeUrlSymbols,
  checkStatement,
} from "../utils/kotlin-lib-functions";
import { addStyles } from "react-mathquill";
import { plainSignToUrlSign, urlSignToPlainSign } from "./main-page.utils";
// icons
import sumIcon from "../assets/math-symbols/sum.svg";
import squareIcon from "../assets/math-symbols/square-root.svg";
import piIcon from "../assets/math-symbols/pi.svg";
// styles
import "./main-page.scss";
// inserts the required mathquill css to the <head> block.
addStyles();

let alertCount = 0; //To avoid alert duplicates. TODO: make something normal

const MainPage = () => {
  const { Option } = Select;
  // getting url query params
  const history = useHistory();
  const possibleComparisonSigns = ["=", ">=", ">", "<", "<="];
  const {
    mode: modeUrl,
    originalExpression: originalExpressionUrl,
    endExpression: endExpressionUrl,
    rulePack: rulePackUrl,
    hideDetails: hideDetailsUrl,
    comparisonType: comparisonTypeUrl,
  } = Object.fromEntries(
    useLocation()
      .search.slice(1)
      .split("&")
      .map((queryStr) => {
        return queryStr.split("=");
      })
  );
  const [selectedComparisonSign, setSelectedComparisonSign] = useState(
    comparisonTypeUrl !== undefined
      ? urlSignToPlainSign(comparisonTypeUrl)
      : "="
  );
  // local utils
  const formSolutionStartingTex = () => {
    if (currentMode === "Generate tasks") {
      return "";
    }
    let solutionSignView = selectedComparisonSign;
    if (selectedComparisonSign === ">=") {
      solutionSignView = " \\ge ";
    } else if (selectedComparisonSign === "<=") {
      solutionSignView = " \\le ";
    } else if (selectedComparisonSign === "<") {
      solutionSignView = " \\lt ";
    } else if (selectedComparisonSign === ">") {
      solutionSignView = " \\gt ";
    }
    return startTex + solutionSignView + "..." + solutionSignView + endTex;
  };
  const reverseGameMode = async () => {
    await setCurrentMode("Solve");
    await setCurrentMode("Play");
  };
  const createDefaultAndDisabledClassName = (className) => {
    if (hideDetails) {
      return `${className} ${className}--disabled`;
    } else {
      return className;
    }
  };

  const checkExpressionUrl = (expressionUrl, type) => {
    if (expressionUrl) {
      try {
        convertMathInput(
          "STRUCTURE_STRING",
          "TEX",
          decodeUrlSymbols(expressionUrl)
        );
      } catch (e) {
        if (alertCount === 0) {
          alert(
            "Error in the " +
              type +
              " expressioin: '" +
              e.message +
              "'. Default value will be used"
          );
          alertCount = alertCount + 1;
        }
        return false;
      }
      return true;
    } else return false;
  };
  // static data
  const defaultStart = checkExpressionUrl(originalExpressionUrl, "start")
    ? decodeUrlSymbols(originalExpressionUrl)
    : "(sin(*(2;x)))";
  const defaultEnd = checkExpressionUrl(endExpressionUrl, "end")
    ? decodeUrlSymbols(endExpressionUrl)
    : "(*(2;sin(x);cos(x)))";
  const rulePacks = [
    "Logic",
    "ShortMultiplication",
    "Logarithm",
    "Trigonometry",
  ];
  const modes = ["Play", "Solve", "Check Statement", "Generate tasks"];
  // app dependencies
  const [startSS, setStartSS] = useState(defaultStart);
  const [endSS, setEndSS] = useState(defaultEnd);
  const [currentRulePack, setCurrentRulePack] = useState(
    rulePackUrl && rulePacks.includes(rulePackUrl) ? rulePackUrl : "Trigonometry"
  );
  const [currentTasks, setCurrentTasks] = useState([]);
  const [currentTaskIndex, setCurrentTasksIndex] = useState(null);

  const hideDetails =
    hideDetailsUrl !== undefined ? hideDetailsUrl === "true" : false;
  const correctSolution =
    startSS === "(+(3;*(4;cos(*(2;x)));cos(*(4;x))))" &&
    endSS === "(*(8;^(cos(x);4)))" &&
    currentRulePack === "Trigonometry" &&
    selectedComparisonSign === "="
      ? "3+4\\cdot \\cos \\left(2\\cdot x\\right)+\\cos \\left(4\\cdot x\\right)=3+4\\cdot \\left(2\\cdot \\cos ^2\\left(x\\right)-1\\right)+\\left(2\\cdot \\cos ^2\\left(2\\cdot x\\right)-1\\right)=3+4\\cdot \\left(2\\cdot \\cos ^2\\left(x\\right)-1\\right)+2\\cdot \\left(2\\cdot \\cos ^2\\left(x\\right)-1\\right)^2-1=8\\cdot \\cos \\left(x\\right)^4"
      : startSS === "(+(2;*(4;cos(*(2;x)));cos(*(4;x))))" &&
        endSS === "(*(8;^(cos(x);4)))" &&
        currentRulePack === "Trigonometry" &&
        selectedComparisonSign === "<="
      ? "2+4\\cdot \\cos \\left(2\\cdot x\\right)+\\cos \\left(4\\cdot x\\right)\\le 3+4\\cdot \\left(2\\cdot \\cos ^2\\left(x\\right)-1\\right)+\\left(2\\cdot \\cos ^2\\left(2\\cdot x\\right)-1\\right)\\le 3+4\\cdot \\left(2\\cdot \\cos ^2\\left(x\\right)-1\\right)+2\\cdot \\left(2\\cdot \\cos ^2\\left(x\\right)-1\\right)^2-1\\le 8\\cdot \\cos \\left(x\\right)^4"
      : null;
  const [startTex, setStartTex] = useState(
    convertMathInput("STRUCTURE_STRING", "TEX", defaultStart)
  );
  const [endTex, setEndTex] = useState(
    convertMathInput("STRUCTURE_STRING", "TEX", defaultEnd)
  );
  const [currentMode, setCurrentMode] = useState(
    modes.includes(modeUrl) ? modeUrl : "Generate tasks"
  );
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
          `mode=${currentMode}` +
          `&originalExpression=${startSSConverted}` +
          `&endExpression=${endSSConverted}` +
          `&rulePack=${currentRulePack}` +
          `&hideDetails=${hideDetails}` +
          (plainSignToUrlSign(selectedComparisonSign) !== "="
            ? `&comparisonType=${plainSignToUrlSign(selectedComparisonSign)}`
            : "")
      );
      setStartError(null);
      setEndError(null);
      setSuccessMsg(null);
      setSolutionError(null);
      setSolutionInTex(formSolutionStartingTex());
      if (currentMode === "Play") {
        await reverseGameMode();
      }
    }
  };

  const onCheckTexSolutionInput = () => {
    const res = checkTex(
      solutionInTex,
      startSS,
      endSS,
      selectedComparisonSign,
      [currentRulePack]
    );
    if (res.errorMessage) {
      setSuccessMsg(null);
      setSolutionError(res.errorMessage);
    } else {
      setSolutionError(null);
      setSuccessMsg("Congratulations! Correct solution!");
    }
    setSolutionInTex(res.validatedSolution);
  };

  const onPrevTaskClick = () => {
    if (currentTasks.length === 0) {
      return;
    }
    let updatedIndex = currentTaskIndex;
    if (currentTaskIndex > 0) {
      updatedIndex = currentTaskIndex - 1;
    } else {
      updatedIndex = currentTasks.length - 1;
    }
    setCurrentTasksIndex(updatedIndex);
    let task = currentTasks[updatedIndex];
    setSolutionInTex(task['goalExpressionPlainText']);
  }

  const onNextTaskClick = () => {
    if (currentTasks.length === 0) {
      return;
    }
    let updatedIndex = currentTaskIndex;
    if (currentTaskIndex < currentTasks.length - 1) {
      updatedIndex = currentTaskIndex + 1;
    } else {
      updatedIndex = 0;
    }
    setCurrentTasksIndex(updatedIndex)
    let task = currentTasks[updatedIndex];
    setSolutionInTex(task['goalExpressionPlainText']);
  }

  function getCurrentTask() {
    if (currentTasks.length === 0) {
      return [];
    }
    return currentTasks[currentTaskIndex]
  }
  
  const onSwitchToSolveMode = () => {
    let task = getCurrentTask();
    setCurrentMode("Solve");
    setStartTex(task['goalExpressionPlainText']);
    setEndTex(task['originalExpressionPlainText']);
    setSolutionInTex(task['goalExpressionPlainText'] + "= ... =" + task['originalExpressionPlainText']);
    setSuccessMsg(null);
  }

  const onGenerateTasksInput = () => {
    let startExpression = convertMathInput("TEX", "STRUCTURE_STRING", startTex);
    let area = convertMathInput("TEX", "STRUCTURE_STRING", currentRulePack);

    const tasks = generateTasks(
      area,
      startExpression,
      [],
      {complexity: 0.0}
    );

    if (tasks.errorMessage) {
      setSuccessMsg(null);
      setSolutionError(tasks.errorMessage);
    } else {
      setSolutionError(null);
      setSuccessMsg("Tasks generated total: " + tasks.length);
    }

    if (tasks.length > 0) {
      let task = tasks[0]
      setSolutionInTex(task['goalExpressionPlainText']);
    } else {
      setSolutionInTex("");
    }

    setCurrentTasks(tasks);
    setCurrentTasksIndex(0);
  };

  const onCheckStatement = () => {
    const {
      res,
      // startExpression,
      // endExpression,
      // comparisonSign,
      // TODO: add rulePacks
    } = checkStatement(solutionInTex, []);
    if (res.errorMessage) {
      setSuccessMsg(null);
      setSolutionError(res.errorMessage);
    } else {
      setSolutionError(null);
      setSuccessMsg("Correct!");
    }
    // setStartTex(startExpression);
    // setEndTex(endExpression);
    // setSelectedComparisonSign(urlSignToPlainSign(comparisonSign));
    setSolutionInTex(res.validatedSolution);
  };

  useEffect(() => {
    if (showSpinner && currentMode === "Generate tasks") {
      onGenerateTasksInput();
    } else if (showSpinner && currentMode === "Solve") {
      onCheckTexSolutionInput();
    } else if (showSpinner && currentMode === "Check Statement") {
      onCheckStatement();
    }
    setShowSpinner(false);
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
      <div className="app__tabs">
        {modes.map((mode) => {
          return (
            <div
              key={mode}
              onClick={() => {
                setCurrentMode(mode);
              }}
              className={`app__tab ${
                currentMode === mode ? "app__tab--selected" : ""
              }`}
            >
              {mode}
            </div>
          );
        })}
        <div className="app__tab--bottom-line" />
      </div>
      {currentMode !== "Check Statement" && currentMode !== "Generate tasks" && (
        <div className="app__inputs">
          <div className={createDefaultAndDisabledClassName("app__tex-inputs")}>
            <div
              className={createDefaultAndDisabledClassName("app__tex-input")}
            >
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
            <div
              className={createDefaultAndDisabledClassName("app__tex-input")}
            >
              {currentMode === "Play" ? (
                <h2 style={{ marginRight: "1rem" }}>Equals</h2>
              ) : (
                <Select
                  showSearch={true}
                  defaultValue={selectedComparisonSign}
                  onChange={(value) => {
                    setSelectedComparisonSign(value);
                  }}
                  style={{
                    width: "7rem",
                    marginTop: "-0.2rem",
                    marginRight: "1rem",
                  }}
                >
                  {possibleComparisonSigns.map((sign) => (
                    <Option key={sign} value={sign}>
                      {sign}
                    </Option>
                  ))}
                </Select>
              )}
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
              <Button type="primary" onClick={onCreateTask}>
                Change Task!
              </Button>
            </div>
          )}
        </div>
      )}

      {currentMode === "Generate tasks" && (
        <div className="app__inputs">
          <div className={createDefaultAndDisabledClassName("app__tex-inputs")}>
            <div
              className={createDefaultAndDisabledClassName("app__tex-input")}
            >
              <h2>Start expression: </h2>
              {!hideDetails ? (
                <EditableMathField
                  latex={startTex}
                  onChange={(mathField) => {
                    setStartTex(mathField.latex());
                  }}
                  style={{
                    width: "22rem",
                    margin: "10px",
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
              <Button type="primary" onClick={onGenerateTasksInput}>
                Generate tasks!
              </Button>
            </div>
            <div
              className={createDefaultAndDisabledClassName("app__tex-input")}
            >
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
            </div>
          )}
        </div>
      )}
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
      {currentMode === "Play" && (
        <GameEditor start={startSS} end={endSS} rulePacks={currentRulePack} />
      )}
      {currentMode !== "Play" && (
        <div className="app__tex-solution-block">
          {currentMode === "Solve" && (
            <h1>Write solution instead of dots (in TeX)</h1>
          )}
          {currentMode === "Check Statement" && (
            <h1>Write statement and check if it's correct (in TeX)</h1>
          )}
          <div className="tex-solution">
            <div className="tex-solution__operations">
              {actions.map((action, i) => {
                const { iconUrl, latexCmd, tooltip } = action;
                return (
                  <div key={i} className="tex-solution__operation">
                    {tooltip ? (
                      <Tooltip title={tooltip} placement="bottom">
                        <img src={iconUrl} onClick={() => latexCmd()} />
                      </Tooltip>
                    ) : (
                      <img src={iconUrl} onClick={() => latexCmd()} />
                    )}
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


            {currentMode !== "Generate tasks" &&
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
            }

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

            {currentMode === "Generate tasks" &&
              <Button
                onClick={onPrevTaskClick}
                style={{
                  marginTop: "1rem",
                }}
                type="primary"
              >
                ◄
              </Button>
            }

            {currentMode === "Generate tasks" &&
              <Button
                onClick={onNextTaskClick}
                style={{
                  marginTop: "1rem",
                }}
                type="primary"
              >
                ►
              </Button>
            }

            {currentMode === "Generate tasks" &&
              <Button
                onClick={onSwitchToSolveMode}
                style={{
                  marginTop: "1rem",
                }}
                type="primary"
              >
              Solve
              </Button>
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;
