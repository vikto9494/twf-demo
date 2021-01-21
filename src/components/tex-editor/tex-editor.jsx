// libs and hooks
import React, { useEffect, useState } from "react";
import { v4 as uidv4 } from "uuid";
// @ts-ignore
import jQuery from "jquery";
//@ts-ignore
import MQ from "../../local-libs/math-quill";
import "../../local-libs/math-quill/mathquill.css";
import piIcon from "../../assets/math-symbols/pi.svg";
import squareIcon from "../../assets/math-symbols/square-root.svg";
import sumIcon from "../../assets/math-symbols/sum.svg";
// style
import "./tex-editor.scss";
// import "./math-quill-editor.scss";
// @ts-ignore
window.jQuery = jQuery;

// TODO: add support for edit function

const MathQuillEditor = ({
  config,
  startingLatexExpression,
  showOperationTab = true,
  inputRef,
  width,
  maxWidth,
  updateValue,
  isInvalid,
  onBlur,
  big = false,
  disable = false,
}) => {
  if (inputRef && inputRef.current) {
    inputRef.current.style.display = "none";
  }
  const [editor, setEditor] = useState();
  // generating unique id by uuid library
  const id = uidv4();

  useEffect(() => {
    const htmlElement = document.getElementById(id);
    MQ();
    // @ts-ignore
    const MathQuill = window.MathQuill.getInterface(2);
    const mathField = (() => {
      if (disable) {
        return MathQuill.StaticMath(htmlElement);
      } else {
        return config
          ? MathQuill.MathField(htmlElement, config)
          : MathQuill.MathField(htmlElement);
      }
    })();

    // if (config && config.handlers) {
    //   mathField.config({
    //     ...config,
    //     handlers: {
    //       ...config.handlers,
    //       edit: function () {
    //         // edit function initialized for the first time
    //         if (config.handlers.fns && config.handlers.fns.edit) {
    //           config.handlers.fns.edit();
    //         }
    //         // edit function is already initialized
    //         // if (config.handlers.edit) {
    //         //   config.handlers.edit();
    //         // }
    //         if (inputRef.current) {
    //           inputRef.current.value = mathField.latex();
    //         }
    //       },
    //     },
    //   });
    // } else if (config) {
    //   mathField.config({
    //     ...config,
    //     handlers: {
    //       edit: function () {
    //         if (inputRef.current) {
    //           inputRef.current.value = mathField.latex();
    //         }
    //       },
    //     },
    //   });
    // } else {
    //   mathField.config({
    //     spaceBehavesLikeTab: true,
    //     handlers: {
    //       edit: function () {
    //         if (inputRef.current) {
    //           inputRef.current.value = mathField.latex();
    //         }
    //         if (updateValue) {
    //           updateValue(mathField.latex());
    //         }
    //       },
    //     },
    //   });
    // }

    if (!disable) {
      mathField.config({
        ...config,
        spaceBehavesLikeTab: true,
        handlers: {
          edit: function () {
            if (inputRef && inputRef.current) {
              inputRef.current.value = mathField.latex();
            }
            if (updateValue) {
              updateValue(mathField.latex());
            }
          },
        },
      });
    }

    if (startingLatexExpression) {
      mathField.latex(startingLatexExpression);
    }

    setEditor(mathField);

    if (htmlElement && onBlur) {
      htmlElement.firstChild?.addEventListener("focusout", () => {
        onBlur(mathField.latex());
      });
    }
  }, []);

  const actions = [
    {
      iconUrl: sumIcon,
      latexCmd: "\\sum",
    },
    {
      iconUrl: squareIcon,
      latexCmd: "\\sqrt",
    },
    {
      iconUrl: piIcon,
      latexCmd: "\\pi",
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
    <div
      className={`math-quill-editor ${big ? "math-quill-editor--big" : ""}`}
      style={{ width }}
    >
      {showOperationTab && (
        <div className="math-quill-editor__operations">
          {actions.map((action, i) => {
            const { iconUrl, latexCmd } = action;
            return (
              <div key={i} className="math-quill-editor__operation">
                <img src={iconUrl} onClick={() => editor.cmd(latexCmd)} />
              </div>
            );
          })}
        </div>
      )}
      <span
        className="math-quill-editor__main-input"
        id={id}
        style={{ width }}
      />
    </div>
  );
};

export default MathQuillEditor;
