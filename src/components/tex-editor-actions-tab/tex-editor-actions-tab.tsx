import React from "react";
// icons
import fracIcon from "../../assets/math-symbols/frac.svg";
import powIcon from "../../assets/math-symbols/pow.svg";
import sumIcon from "../../assets/math-symbols/sum.svg";
import prodIcon from "../../assets/math-symbols/prod.svg";
import squareIcon from "../../assets/math-symbols/square-root.svg";
import piIcon from "../../assets/math-symbols/pi.svg";
import andIcon from "../../assets/math-symbols/and.svg";
import orIcon from "../../assets/math-symbols/or.svg";
import xorIcon from "../../assets/math-symbols/xor.svg";
import alleqIcon from "../../assets/math-symbols/alleq.svg";
import negIcon from "../../assets/math-symbols/neg.svg";
import implicIcon from "../../assets/math-symbols/implic.svg";
import setminusIcon from "../../assets/math-symbols/setminus.svg";
// types
import { MathField } from "react-mathquill";
// styles
import "./tex-editor-actions-tab.scss";

const TexEditorActionsTab: React.FC<{ mathField: MathField }> = ({
  mathField,
}) => {
  const actions = [
    {
      iconUrl: fracIcon,
      latexCmd: "\\frac",
    },
    {
      iconUrl: powIcon,
      latexCmd: "^",
    },
    {
      iconUrl: squareIcon,
      latexCmd: "\\sqrt",
    },
    {
      iconUrl: piIcon,
      latexCmd: "\\pi",
    },
    {
      iconUrl: sumIcon,
      latexCmd: "\\sum",
    },
    {
      iconUrl: prodIcon,
      latexCmd: "\\prod",
    },
    {
      iconUrl: negIcon,
      latexCmd: "\\neg",
    },
    {
      iconUrl: andIcon,
      latexCmd: "\\wedge",
    },
    {
      iconUrl: orIcon,
      latexCmd: "\\vee",
    },
    {
      iconUrl: xorIcon,
      latexCmd: "\\oplus",
    },
    {
      iconUrl: alleqIcon,
      latexCmd: "\\equiv",
    },
    {
      iconUrl: implicIcon,
      latexCmd: "\\implies",
    },
    {
      iconUrl: setminusIcon,
      latexCmd: "\\setminus",
    },
  ];

  return (
    <div className="tex-editor-actions-tab">
      {actions.map((action, i) => {
        const { iconUrl, latexCmd } = action;
        return (
          <div key={i} className="tex-editor-actions-tab__operation">
            <img src={iconUrl} onClick={() => mathField.cmd(latexCmd)} />
          </div>
        );
      })}
    </div>
  );
};

export default TexEditorActionsTab;
