const twfKotlinLibrary = window["twf-kotlin-lib"];

// LIB API FUNCTIONS
// format -> expression
export const stringToExpression =
    twfKotlinLibrary.api.stringToExpression_y630ta$;
const structureStringToExpression =
    twfKotlinLibrary.api.structureStringToExpression_69c2cy$;
const texToExpression = twfKotlinLibrary.api.stringToExpression_y630ta$;

// expression -> format
const expressionToTexString =
    twfKotlinLibrary.api.expressionToTexString_tvfpvg$;
const expressionToStructureString =
    twfKotlinLibrary.api.expressionToStructureString_6718cy$;
const expressionToString = twfKotlinLibrary.api.expressionToString_tvfpvg$;

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

export const createConfigurationFromRulePacksAndDetailSolutionCheckingParams = (rulePacks) => {
    return twfKotlinLibrary.createConfigurationFromRulePacksAndDetailSolutionCheckingParams(
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
        undefined);
};

export const checkTexWithoutCompiledConfigurationCreating = (fullExpression, start, end, comparisonSign, compiledConfiguration) => {
    return twfKotlinLibrary.checkSolutionInTexWithCompiledConfiguration(
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

export const checkTex = (fullExpression, start, end, comparisonSign, rulePacks) => {
    return twfKotlinLibrary.checkSolutionInTex(
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

export const decodeUrlSymbols = (string) => {
    return twfKotlinLibrary.decodeUrlSymbols(string);
};
