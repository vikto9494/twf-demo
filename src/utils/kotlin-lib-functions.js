const twf_js = window["twf_js"];

// LIB API FUNCTIONS
// format -> expression
export const stringToExpression = twf_js.stringToExpression;
const structureStringToExpression = twf_js.structureStringToExpression;
const texToExpression = twf_js.stringToExpression;

// expression -> format
const expressionToTexString = twf_js.expressionToTexString;
const expressionToStructureString = twf_js.expressionToStructureString;
const expressionToString = twf_js.expressionToString;

class MathInputConvertingError extends Error {
  constructor(message) {
    super(message);
    this.name = "MathInputConvertingError";
  }
}

export const convertMathInput = (from, to, expression) => {
  const expressionInLibFormat = (() => {
    if (from === "PLAIN_TEXT") {
      return stringToExpression(expression);
    } else if (from === "STRUCTURE_STRING") {
      return structureStringToExpression(expression);
    } else if (from === "TEX") {
      // lib understands '//' as '/' in classic TEX
      return texToExpression(expression.replace(/\//g, "//"));
    }
  })();
  if (expressionInLibFormat.nodeType.name$ === "ERROR") {
    throw new MathInputConvertingError(expressionInLibFormat.value);
  }
  if (to === "PLAIN_TEXT") {
    return expressionToString(expressionInLibFormat);
  } else if (to === "STRUCTURE_STRING") {
    return expressionToStructureString(expressionInLibFormat);
  } else if (to === "TEX") {
    return expressionToTexString(expressionInLibFormat);
  }
};

export const getErrorFromMathInput = (format, expression) => {
  const expressionInLibFormat = (() => {
    if (format === "PLAIN_TEXT") {
      return stringToExpression(expression);
    } else if (format === "STRUCTURE_STRING") {
      return structureStringToExpression(expression);
    } else if (format === "TEX") {
      // lib understands '//' as '/' in classic TEX
      return texToExpression(expression.replace(/\//g, "//"));
    }
  })();
  return expressionInLibFormat.nodeType.name$ === "ERROR"
    ? expressionInLibFormat.value
    : null;
};

export const createConfigurationFromRulePacksAndDetailSolutionCheckingParams = (
  rulePacks
) => {
  return twf_js.createConfigurationFromRulePacksAndDetailSolutionCheckingParams(
    rulePacks,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined
  );
};

export const checkTexWithoutCompiledConfigurationCreating = (
  fullExpression,
  start,
  end,
  comparisonSign,
  compiledConfiguration
) => {
  return twf_js.checkSolutionInTexWithCompiledConfiguration(
    fullExpression,
    compiledConfiguration,
    start,
    undefined,
    comparisonSign,
    "",
    end,
    undefined,
    undefined
  );
};

export const checkTex = (
  fullExpression,
  start,
  end,
  comparisonSign,
  rulePacks
) => {
  return twf_js.checkSolutionInTex(
    fullExpression,
    start,
    undefined,
    "",
    end,
    undefined,
    comparisonSign,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    rulePacks,
    undefined,
    undefined,
    undefined
  );
};

export const getLogOfGeneration = () => {
  let log = twf_js.getLogOfGeneration();
  return log;
};

export const getReportOfGeneration = () => {
  let log = twf_js.getReportOfGeneration();
  return log;
};

export const getAllSortTypesForGeneration = () => {
  let sortTypes = twf_js.getAllSortTypesForGeneration();
  return sortTypes;
};

export const getAllSortOrdersForGeneration = () => {
  let sortTypes = twf_js.getAllSortOrdersForGeneration();
  return sortTypes;
};

export const getAllTagsForGeneration = (area) => {
  let tags = twf_js.getAllTagsForGeneration(area);
  return tags;
};

export const generateTasks = (
  area,
  startExpression,
  rulepacks,
  additionalParamsJsonString
) => {
    console.log("Task Generation Params", area, startExpression, additionalParamsJsonString);
  let tasks = twf_js.generateTasks(
      area,
      startExpression,
      rulepacks,
      additionalParamsJsonString
  );
  console.log(tasks);
  return tasks;
};

export const checkStatement = (fullExpression, rulePacks) => {
  return {
    res: twf_js.checkSolutionInTex(
        fullExpression,
        "",
        "",
        "",
        "",
        "",
        "",
        undefined,
        "",
        undefined,
        undefined,
        undefined,
        " ",
        undefined,
        rulePacks,
        undefined,
        undefined,
        undefined
    ),
  };
};

export const decodeUrlSymbols = (string) => {
  return twf_js.decodeUrlSymbols(string);
};
