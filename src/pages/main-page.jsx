// hooks and libs
import React, {useEffect, useRef, useState} from "react";
import { useNavigate, useLocation } from "react-router-dom";
// lib components
import { Alert, Button, Select, Tooltip } from "antd";
import ClipLoader from "react-spinners/ClipLoader";
import {EditableMathField, MathField, StaticMathField} from "react-mathquill";
import MathQuillMultyline from "../components/math-quill-multyline/math-quill-multyline";
// custom components
import Multiselect from 'multiselect-react-dropdown';
import GameEditor from "../components/game-editor/game-editor";
import Slider from 'react-input-slider';
import { saveAs } from "file-saver";

// utils
import {
  convertMathInput,
  checkTex,
  generateTasks,
  decodeUrlSymbols,
  checkStatement,
  getAllLogInPlainText,
  getAllTagsForGeneration,
  getLogOfGeneration,
  getReportOfGeneration,
  getAllSortTypesForGeneration,
  getAllSortOrdersForGeneration
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
  //let mathQuillMultyline = MathQuillMultyline({});

  const { Option } = Select;
  // getting url query params
  const navigate = useNavigate();
  const possibleComparisonSigns = ["=", ">=", ">", "<", "<="];
  const {
    mode: modeUrl,
    originalExpression: originalExpressionUrl,
    endExpression: endExpressionUrl,
    startTaskForGenerator: startTaskForGeneratorUrl,
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
    if (currentMode === "GenerateTasks") {
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
  const defaultStartForGenerator = checkExpressionUrl(startTaskForGeneratorUrl, "startForGenerator")
    ? decodeUrlSymbols(startTaskForGeneratorUrl)
    : "(1)";
  const defaultStart = checkExpressionUrl(originalExpressionUrl, "start")
    ? decodeUrlSymbols(originalExpressionUrl)
    : "(and(a;or(a;b)))";
  const defaultEnd = checkExpressionUrl(endExpressionUrl, "end")
    ? decodeUrlSymbols(endExpressionUrl)
    : "(a)";
  const rulePacks = [
    "Logic",
    "ShortMultiplication",
    "Logarithm",
    "Trigonometry",
  ];
  const modes = ["Play", "Solve", "Check Statement", "GenerateTasks"];
  // app dependencies
  const [startSS, setStartSS] = useState(defaultStart);
  const [endSS, setEndSS] = useState(defaultEnd);
  const [currentRulePack, setCurrentRulePack] = useState(
    rulePackUrl && rulePacks.includes(rulePackUrl) ? rulePackUrl : "Logic"
  );
  const [currentTasks, setCurrentTasks] = useState([]);
  const [allSupportedTags, setAllSupportedTags] = useState(getAllTagsForGeneration(convertMathInput("TEX", "STRUCTURE_STRING", "(Trigonometry)")))
  const [allSupportedSortings, setAllSupportedSortings] = useState(getAllSortTypesForGeneration())
  const [allSupportedSortOrders, setAllSupportedSortOrders] = useState(getAllSortOrdersForGeneration())
  const [defaultTags, setDefaultTags] = useState(getDefaultTags())
  const [currentTags, setCurrentTags] = useState(defaultTags);
  const [sortType, setSortType] = useState(getDefaultSortType());
  const [sortOrder, setSortOrder] = useState(getDefaultSortOrder());
  const [complexityValue, setComplexityValue] = useState(40);
  const [depthValue, setDepthValue] = useState(25);

  function getDefaultSortType() {
    let defaultSortType = getAllSortTypesForGeneration()
      .filter((sortTypeEnum) => sortTypeEnum['name$'] === 'BY_RULE_TAG_USAGE')[0]
    return defaultSortType;
  }

  function getDefaultSortOrder() {
    let defaultSortOrder = getAllSortOrdersForGeneration()
      .filter((sortOrderEnum) => sortOrderEnum['name$'] === 'DESC')[0]
    return defaultSortOrder;
  }

  function getDefaultTags() {
    let defaultTags = ['TRIGONOMETRY_DOUBLE_ANGLES', 'TRIGONOMETRY_BASIC_IDENTITY', 'TRIGONOMETRY_SHIFTING']
    return getAllTagsForGeneration(convertMathInput("TEX", "STRUCTURE_STRING", "(Trigonometry)"))
      .filter(tag => defaultTags.includes(tag['name$']))
  }

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
  const showGetLogButton = true;


  const [startTaskForGenerator, setStartTaskForGenerator] = useState(
    convertMathInput("STRUCTURE_STRING", "TEX", defaultStartForGenerator)
  );
  const [startTex, setStartTex] = useState(
    convertMathInput("STRUCTURE_STRING", "TEX", defaultStart)
  );
  const [endTex, setEndTex] = useState(
    convertMathInput("STRUCTURE_STRING", "TEX", defaultEnd)
  );
  const [currentMode, setCurrentMode] = useState(
    modes.includes(modeUrl) ? modeUrl : "Play"
  );
  const solutionInTex = useRef(formSolutionStartingTex());
  const [solutionInTexStart, setSolutionInTexStart] = useState(formSolutionStartingTex());
  const [mathField, setMathField] = useState();
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
      navigate(
        `/?` +
          `mode=${currentMode}` +
          `&originalExpression=${startSSConverted}` +
          `&endExpression=${endSSConverted}` +
          `&startTaskForGenerator=${startTaskForGenerator}` +
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
      setSolutionInTexStart(formSolutionStartingTex());
      if (currentMode === "Play") {
        await reverseGameMode();
      }
    }
  };

  const onSelectTag = (selectedList, selectedItem) => {
    setCurrentTags(selectedList);
  };

  const onRemoveTag = (selectedList, selectedItem) => {
    setCurrentTags(selectedList);
  };

  const onCheckTexSolutionInput = () => {
    const res = checkTex(
      solutionInTex.current,
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
    setSolutionInTexStart(res.validatedSolution);
  };

  const onGenerateTasksInput = () => {  
    let startExpression = ""
    try {  
      startExpression = convertMathInput("TEX", "STRUCTURE_STRING", startTaskForGenerator);
    }
    catch (err) {
      setSuccessMsg(null);
      setCurrentTasks([]);
      console.log(err);
      setSolutionError(err['message']);
      return
    }
    let area = convertMathInput("TEX", "STRUCTURE_STRING", currentRulePack);

    const additionalParamsJsonString = JSON.stringify({
      complexity: (complexityValue / 100.0).toString(),
      depth: (depthValue / 100.0).toString(),
      tags: currentTags.map(tag => tag['name$']),
      sort: sortType['name$'],
      sortOrder: sortOrder['name$']
    });
    let tasks = []
    try {
      tasks = generateTasks(
        area,
        startExpression,
        [],
          additionalParamsJsonString
      );
    }
    catch (err) {
      setSuccessMsg(null);
      setCurrentTasks([]);
      setSolutionError('Ошибка генерации. Попробуйте ещё раз. ' + err['message']);
      console.log(err);
      return
    }
    

    if (tasks.errorMessage) {
      setSuccessMsg(null);
      setSolutionError(tasks.errorMessage);
    } else {
      setSolutionError(null);
      setSuccessMsg("Сгенерировано задач: " + tasks.length);
    }

    if (tasks.length > 0 && tasks.every(task => task['difficulty'] < task['targetDifficulty'] 
      && task['targetDifficulty'] - task['difficulty'] > 1)) {
      setSuccessMsg(null);
      setSolutionError("Не получилось получить задачи с такими требованиями. Вы можете: попробовать снова; поменять ответ; понизить сложность; добавить больше тем; увеличить глубину.");
    }

    setCurrentTasks(tasks);
  };

  const getMathQuillNotebook = () => {
    return <MathQuillMultyline
        latex={solutionInTexStart}
        //mathquillDidMount={(mathField) => setSolutionMathField(mathField)}
        onChange={(s) => {

          if (s && s.length !== 2) {
            console.error("BAD FUNC CALLED");
          }

          solutionInTex.current = s[1];
          console.log("solutionInTex.current!!!")
          console.log(solutionInTex.current)
          if (s[0] === "1") {
            setSolutionInTexStart(s[1]);
          }

        }}
        style={{
          minWidth: "40rem",
          maxWidth: window.innerWidth - 100 + "px",
          fontSize: "2.2rem",
        }}
    />
  }

  const getSubjectAreaSection = () => {
    if (currentMode === 'GenerateTasks') {
      return;
    }
    let content = [];
    if (!hideDetails) {
      content.push(
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
      )
    }
    return content;
  }
  
  const getSectionForDevelopers = () => {
    if (currentMode !== 'GenerateTasks') {
      return;
    }
    let content = [];
    //if (currentTasks.length > 0) {
      content.push(
        <div>
          <Button
            onClick={function () {
              var blob = new Blob([getLogOfGeneration()], {
                type: "text/plain;charset=utf-8;",
              });
              saveAs(blob, "log.txt");
            }}
            style={{
              marginBottom: "20px",
            }}
            type="primary"
          >
            Скачать лог
          </Button>
        </div>
      );
    //}
    if (currentTasks.length > 0) {
      content.push(
        <div>
          <Button
            onClick={function () {
              var blob = new Blob([getReportOfGeneration()], {
                type: "text/plain;charset=utf-8;",
              });
              saveAs(blob, "report_tex.txt");
            }}
            style={{
              marginBottom: "20px",
            }}
            type="primary"
          >
            Скачать отчёт
          </Button>
        </div>
      );
    }
    return content;
  };

  const getMathQuillNotebooks = () => {
    if (currentMode !== 'GenerateTasks') {
      return getMathQuillNotebook();
    }
    let content = [];
    let notebooksCount = currentTasks.length;
    for (let i = 0; i < notebooksCount; i++) {
      let task = currentTasks[i];
      let taskText = replaceArcFunctionsNames(task['goalExpressionTex']);
      let answerText = replaceArcFunctionsNames(task['originalExpressionTex']);

      content.push(
        <div>
          <Button
            onClick={function() {
              setCurrentMode("Solve");
              let startExpression = taskText;
              let goalExpression = answerText;
              setStartSS(convertMathInput("TEX", "STRUCTURE_STRING", startExpression));
              setEndSS(convertMathInput("TEX", "STRUCTURE_STRING", goalExpression));
              setStartTex(startExpression);
              setEndTex(goalExpression);
              setSolutionInTexStart(startExpression + "= ... =" + goalExpression);
              setSuccessMsg(null);
              setCurrentTasks([]);
            }}
            style={{
              marginLeft: "20px",
            }}
            type="primary"
          >
          Решить
          </Button>

          <EditableMathField
            latex={taskText}
            style={{
              backgroundColor: 'white',
              minWidth: "40rem",
              maxWidth: window.innerWidth - 50 + "px",
              fontSize: "2.2rem",
              margin: "10px"
            }}
          />
        </div> 
      );
    }
    return content;
  };

  function replaceArcFunctionsNames(taskText) {
    taskText = taskText.replaceAll('asin', 'arcsin');
    taskText = taskText.replaceAll('acos', 'arccos');
    taskText = taskText.replaceAll('atg', 'arctan');
    taskText = taskText.replaceAll('actg', 'arccot');
    return taskText;
  }

  const onCheckStatement = () => {
    const {
      res,
      // startExpression,
      // endExpression,
      // comparisonSign,
      // TODO: add rulePacks
    } = checkStatement(solutionInTex.current, []);
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
    setSolutionInTexStart(res.validatedSolution);
  };

  useEffect(() => {
    if (showSpinner && currentMode === "GenerateTasks") {
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

  return (
    <div className="app">
      <div className="app__tabs">
        {modes.map((mode) => {
          return (
            <div
              key={mode}
              onClick={() => {
                setCurrentMode(mode);
                if (mode === 'GenerateTasks') {
                  setCurrentRulePack("Trigonometry")
                }
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
      {currentMode !== "Check Statement" && currentMode !== "GenerateTasks" && (
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
          {getSubjectAreaSection()}
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
          {currentMode !== "GenerateTasks"}

            {currentMode === "GenerateTasks" && (
              <div style={{ "marginBottom": "50px" }}>
                <h1>Генератор задач на преобразование выражений</h1>
                <div className="app__inputs">
                  <div className={createDefaultAndDisabledClassName("app__tex-inputs")}>
                    <div
                      className={createDefaultAndDisabledClassName("app__tex-input")}
                    >
                      <h2>Ответ на задачу: </h2>
                      {!hideDetails ? (
                        <EditableMathField
                          latex={startTaskForGenerator}
                          onChange={(mathField) => {
                            setStartTaskForGenerator(mathField.latex());
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
                      <Button type="primary" onClick={() => {
                        // callback is provided in useEffect
                        setShowSpinner(true);

                      }
                      }>
                        Генерировать!
                      </Button>
                    </div>
                    <div
                      className={createDefaultAndDisabledClassName("app__tex-input")}
                    >
                    </div>
                  </div>
                </div>
                <ClipLoader loading={showSpinner} /> 
                <div style = {{maxWidth: "800px"}}>
                  <h3>Темы</h3>
                  <div>
                  <Multiselect
                    displayValue="code"
                    onRemove={onRemoveTag}
                    onSelect={onSelectTag}
                    options={allSupportedTags}
                    showCheckbox={true}
                    avoidHighlightFirstOption={true}
                    showArrow={true}
                    hidePlaceholder={true}
                    selectedValues={currentTags}
                  />
                  </div>
                  <h3>Сложность задачи</h3>
                  <Slider
                    axis="x"
                    x={complexityValue}
                    onChange={({ x }) => setComplexityValue(x)}
                  />
                  <h3>Глубина генерации</h3>
                  <Slider
                    axis="x"
                    x={depthValue}
                    onChange={({ x }) => setDepthValue(x)}
                  />
                  <h3>Сортировать</h3>
                  <Select
                    defaultValue={getDefaultSortType()['code']}
                    onChange={(sortType) => {
                      setSortType(allSupportedSortings.filter((sorting) => sorting['code'] === sortType)[0]);
                    }}
                    style={{ width: "400px" }}
                  >
                    {allSupportedSortings.map((option) => (
                      <Option key={option['name$']} value={option['code']}>
                        {option['code']}
                      </Option>
                    ))}
                  </Select>
                  <h3>Направление сортировки</h3>
                  <Select
                    defaultValue={getDefaultSortOrder()['code']}
                    onChange={(sortOrder) => {
                      setSortOrder(allSupportedSortOrders.filter((sorting) => sorting['code'] === sortOrder)[0]);
                    }}
                    style={{ width: "400px" }}
                  >
                    {allSupportedSortOrders.map((option) => (
                      <Option key={option['name$']} value={option['code']}>
                        {option['code']}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
            )}
            {getSectionForDevelopers()}    
            {getMathQuillNotebooks()} 
          </div>
          
          {(successMsg || solutionError) && (
            <Alert
              message={solutionError ? solutionError : successMsg}
              className="alert-msg"
              type={solutionError ? "error" : "success"}
              style={{ marginTop: "1rem" }}
            />
          )}
          <div className="app__tex-solution-btns">


            {currentMode !== "GenerateTasks" &&
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

            {currentMode !== "GenerateTasks" && correctSolution && (
              <Button
                onClick={() => {
                  setSolutionInTexStart(correctSolution);
                }}
                style={{
                  marginTop: "1rem",
                }}
                type="success"
              >
                Get correct solution
              </Button>
            )}

            {currentMode !== "GenerateTasks" && showGetLogButton && (
                <Button
                    onClick={function () {
                      var blob = new Blob([getAllLogInPlainText()], {
                        type: "text/plain;charset=utf-8;",
                      });
                      saveAs(blob, "verification_log.txt");
                    }}
                    style={{
                      marginTop: "1rem",
                    }}
                    type="primary"
                >
                  Get log
                </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;
