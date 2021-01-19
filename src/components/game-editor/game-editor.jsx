/* eslint-disable */

import React, {useEffect} from "react";

const GameEditor = ({start, end, rulePacks}) => {
    const cleanDocument = () => {
        document
            .getElementsByTagName("svg")
            .forEach((svg) => svg.parentNode.removeChild(svg));
    };

    useEffect(() => {
        cleanDocument();
        const topButtonsLineHeight = 0;
        const paddingFromTopButtonsLine = (window.innerWidth > 800) ? 80 : window.innerWidth / 10;
        const centralExpressionSize = (window.innerWidth > 800) ? 80 : window.innerWidth / 10;

        const substitutionAreaPadding = (window.innerWidth > 1200) ? 120 : window.innerWidth / 10;
        const substitutionAreaX = substitutionAreaPadding;
        const substitutionAreaY = topButtonsLineHeight + paddingFromTopButtonsLine + centralExpressionSize + substitutionAreaPadding;
        const substitutionAreaWidth = window.innerWidth - 2 * substitutionAreaPadding;
        const substitutionAreaHeight = window.innerHeight - (topButtonsLineHeight + paddingFromTopButtonsLine + centralExpressionSize) - 2 * substitutionAreaPadding;
        const substitutionSize = (window.innerWidth > 1000) ? 50 : window.innerWidth / 20;
        const explanationsSize = (window.innerWidth > 900) ? 30 : window.innerWidth / 30;

        const substitutionAreaInternalPadding = window.innerHeight / 100;
        const substitutionPaddingBetweenParts = window.innerWidth / 100;

        const winLabelAreaY = window.innerHeight / 5 * 2; //topButtonsLineHeight + paddingFromTopButtonsLine + centralExpressionSize + substitutionAreaPadding / 2;
        const winLabelTextSize = (window.innerWidth > 800) ? 40 : window.innerWidth / 20;
        const winLabelHeight = (window.innerWidth > 800) ? 80 : window.innerWidth / 10;
        const winLabelWidth = window.innerWidth - 4 * substitutionAreaPadding;

        const backgroundColour = "#ffffff";
//        const backgroundColour = "#efefef";
        const defaultTextColor = "#254b25";
        const defaultRulesBack = "#cfd8dc";
        const highlightedRulesBack = '#bfc8cc';
        const selectedRuleBack = '#ffbf00';
        const winTextColor = "#254b25";
        const winLabelColor = "#59df5e";

        let height_inner_cont = substitutionAreaHeight / 4;
        let width_inner_cont = substitutionAreaWidth;

        const originalExpression = start ? start : "(and(a;or(a;b)))";
        const endExpression = end ? end : "(a)";
        const rules = rulePacks ? [rulePacks] : ["Logic"];

        compiledConfiguration = window['twf-kotlin-lib'].createConfigurationFromRulePacksAndParams(rules);

        const gameHeight = window.innerHeight - parseFloat(getComputedStyle(document.querySelector('.app__inputs')).height.slice(0, -2));

        let app = new SVG().addTo('body').size(window.innerWidth, gameHeight);

        StartLevel(originalExpression);


        function StartLevel(originalExpression) {
            init(compiledConfiguration, originalExpression, PrintSubstitutions, false, []);
            app.viewbox(0, 0, window.innerWidth, gameHeight);
            app.rect(window.innerWidth, gameHeight).fill(backgroundColour);

            let NewTreeRoot = window['twf-kotlin-lib'].structureStringToExpression(originalExpression);
            let expr = PrintTree(NewTreeRoot, centralExpressionSize, app);

            expr.center((window.innerWidth) / 2, topButtonsLineHeight + paddingFromTopButtonsLine + centralExpressionSize / 2);
            if (expr.width() >= window.innerWidth - paddingFromTopButtonsLine) {
                expr.scale((window.innerWidth - paddingFromTopButtonsLine) / expr.width());
            }

            if (!CheckAndHandleWin(originalExpression, expr.height() - centralExpressionSize)) {
                app.text("Click a part of the expression to transform it").font({
                    size: explanationsSize,
                    family: "u2000",
                    fill: "#000000"
                }).center((window.innerWidth) / 2, substitutionAreaY + explanationsSize);
            }
        }


        /**
         * @return {boolean}
         */
        function CheckAndHandleWin(currentExpression, shift) {
            let y = (shift < 50) ? winLabelAreaY : gameHeight / 5 * 2;
            if (currentExpression === endExpression) {
//        if (window['twf-kotlin-lib'].compareWithoutSubstitutions(currentExpression, endExpression)) {
                app.rect(winLabelWidth, winLabelHeight)
                    .fill(winLabelColor).radius(10)
                    .center((window.innerWidth) / 2, y);
                app.text("Congratulations! You win!").font({
                    size: winLabelTextSize,
                    family: "u2000",
                    fill: winTextColor
                }).center((window.innerWidth) / 2, y);
                return true;
            } else {
                app.rect(winLabelWidth, winLabelHeight)
                    .fill(backgroundColour).radius(10)
                    .center((window.innerWidth) / 2, y);
                return false;
            }
        }

        // function wheel(event) {
        //   let delta;
        //   event = event || window.event;
        //   if (event.wheelDelta) {
        //     delta = event.wheelDelta / 120;
        //     if (window.opera) delta = -delta;
        //   } else if (event.detail) {
        //     delta = -event.detail / 3;
        //   }
        //   if (event.preventDefault) event.preventDefault();
        //   event.returnValue = false;
        //   if (ins(cont, event.pageX, event.pageY)) {
        //     contOfCont.fire('scroll', {some: delta})
        //   }
        // }


        function PrintSubstitutions(listOfValues, arrSubs) {
            let extensionBorderPadding = 20;
            app.rect(substitutionAreaWidth + extensionBorderPadding * 2, substitutionAreaHeight + extensionBorderPadding * 2)
                .move(substitutionAreaX, substitutionAreaY - extensionBorderPadding)
                .fill(backgroundColour).radius(10);
            let rulesContainer = app.group();
            rulesContainer.rect(substitutionAreaWidth + extensionBorderPadding * 2, substitutionAreaHeight + extensionBorderPadding * 2)
                .move(substitutionAreaX, substitutionAreaY - extensionBorderPadding)
                .fill(backgroundColour).radius(10);


            let heighContOfConts = substitutionAreaY;
            for (let i = 0; i < listOfValues.length; ++i) {
                let tmpCont = rulesContainer.group();

                let draw = tmpCont.group();

                tmpCont.add(interactive_button_1(draw, false, i));


                let curCont = draw.group();

                let actualShiftX = substitutionAreaInternalPadding + substitutionAreaX;
                let lolkek = (PlainPrintTree(window['twf-kotlin-lib'].structureStringToExpression(listOfValues[i][0]), substitutionSize, curCont)).x(actualShiftX).y(heighContOfConts);
                actualShiftX += substitutionPaddingBetweenParts;

                let tmpWidth = curCont.width();

                let arrowRight = curCont.group().text("\u27F6").font({
                    size: substitutionSize,
                    family: 'u2000',
                    fill: defaultTextColor
                }).x(actualShiftX + tmpWidth).y(height_inner_cont * i);

                actualShiftX += substitutionPaddingBetweenParts;
                tmpWidth = curCont.width();

                let abs = (PlainPrintTree(window['twf-kotlin-lib'].structureStringToExpression(listOfValues[i][1]), substitutionSize, curCont)).x(actualShiftX + tmpWidth).y(heighContOfConts);

                lolkek.center(lolkek.x() + lolkek.width() / 2, heighContOfConts + abs.height() / 2);
                arrowRight.y(lolkek.y());
                draw.rect(width_inner_cont, curCont.height()).radius(10)
                    .fill(defaultRulesBack).x(substitutionAreaX).y(heighContOfConts);


                let realWidth = curCont.width() - substitutionAreaX;
                if (realWidth >= width_inner_cont - 100) {
                    let scaleCoef = (width_inner_cont - 100) / realWidth;
                    curCont.x(substitutionAreaX - (realWidth - (width_inner_cont - 100)) / 2).scale(scaleCoef);
                }
                draw.add(curCont);


                heighContOfConts += curCont.height() + substitutionAreaInternalPadding;
            }
            let realHeight = heighContOfConts - substitutionAreaY;
            if (realHeight > substitutionAreaHeight) {
                let scaleCoef = substitutionAreaHeight / realHeight;
                rulesContainer.move(substitutionAreaX, substitutionAreaY - (realHeight - realHeight * scaleCoef) / 2).scale(scaleCoef);

            }

            // function moveScrollUp(con, tmp) {
            //   con.animate(300, '<>')
            //       .dy(tmp * 2);
            // }
            //
            // function moveScrollDown(con, tmp) {
            //   con.animate(300, '<>')
            //       .dy(tmp * 2);
            // }
            //
            // rulesContainer.on('scroll', function (e) {
            //   let tmp = e.detail.some;
            //     console.log("scrol: " + tmp);
            //   if (tmp > 0) {
            //     moveScrollUp(rulesContainer, tmp);
            //   } else {
            //     moveScrollDown(rulesContainer, tmp);
            //   }
            // });

            function addHandler(object, event, handler) {
                if (object.addEventListener) {
                    object.addEventListener(event, handler, false, {passive: false});
                } else if (object.attachEvent) {
                    object.attachEvent('on' + event, handler, {passive: false});
                } else alert("Обработчик не поддерживается");
            }

//      addHandler(document, 'mousewheel', wheel);


            function onButtonDownButton1(con, f = false, index = -1) {
                if (con.width() === width_inner_cont)
                    con.animate(300, '<>').fill(selectedRuleBack);
                for (let item of con.children()) {
                    onButtonDownButton1(item);
                }
                if (index !== -1) {
                    let currentExpression = arrSubs[index].resultExpression.toString();
                    StartLevel(currentExpression);
                }
            }


            function onButtonOverButton1(con) {
                if (con.width() === width_inner_cont)
                    con.animate(300, '<>').fill(highlightedRulesBack);
                for (let item of con.children()) {
                    onButtonOverButton1(item);
                }
            }

            function onButtonOutButton1(con) {
                if (con.width() === width_inner_cont)
                    con.animate(300, '<>').fill(defaultRulesBack);
                for (let item of con.children()) {
                    onButtonOutButton1(item);
                }
            }

            function interactive_button_1(cont, f = false, index = -1) {
                let tmp = cont;
                tmp.css('cursor', 'pointer');
                tmp
                    .on('mousedown', () => onButtonDownButton1(cont, f, index))
                    .on('mouseup mouseover', () => onButtonOverButton1(cont))
                    .on('mouseout', () => onButtonOutButton1(cont));
                return tmp;
            }
        }

        return () => cleanDocument();
    }, [start, end]);

    return <div id="Level"></div>;
};

export default GameEditor;
