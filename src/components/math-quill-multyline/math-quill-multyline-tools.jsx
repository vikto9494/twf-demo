const EndString = (text) => {
    let TagList = [];
    for (let i = 0; i < text.length; i++) {
        switch (text[i]) {
            case '{':
                TagList.push("}");
                break;
            case '[':
                TagList.push("]");
                break;
            case '(':
                TagList.push(")");
                break;
            case '}':
            case ']':
            case ')':
                let t = TagList.pop();
                if (t != text[i]) {
                    console.log("Error");
                    console.log(t);
                    console.log(text[i]);
                    console.log(text);
                }
                break;
        }
    }
    let out = "";
    console.log(TagList);
    for (let i = 0; i < TagList.length; i++) {
        out = TagList[i] + out;
    }
    return out;
};

const BeginString = (text) => {
    let TagList = [];
    for (let i = text.length - 1; i >= 0; i--) {
        switch (text[i]) {
            case '}':
                TagList.push("{");
                break;
            case ']':
                TagList.push("[");
                break;
            case ')':
                TagList.push("(");
                break;
            case '{':
            case '[':
            case '(':
                let t = TagList.pop();
                if (t != text[i]) {
                    console.log("Error");
                    console.log(t);
                    console.log(text[i]);
                    console.log(text);
                }
                ;
                break;
        }
    }
    let out = "";
    console.log(TagList);
    for (let i = 0; i < TagList.length; i++) {
        out += TagList[i];
    }
    return TagList;
};

const FindOpenTags = (tagList, text) => {
    let tagListNew = [];
    // Possibility flag
    let out = "";
    let L = 0;
    let flagPoss = true;
    let tagsCompleted = 0;
    for (let i = text.length - 1; i >= 0; i--) {
        if (tagList.length == 0) {
            out = "";
            console.log(tagListNew);
            for (let i = 0; i < tagListNew.length; i++) {
                out += tagListNew[i];
            }
            console.log(flagPoss);
            L = tagListNew.length;
            return { out, flagPoss, L };
        }
        switch (text[i]) {
            case '}':
                tagList.push("{");
                tagsCompleted++;
                break;
            case ']':
                tagList.push("[");
                tagsCompleted++;
                break;
            case ')':
                tagList.push("(");
                tagsCompleted++;
                break;
            case '{':
            case '[':
            case '(':
                let t = tagList.pop();
                if (tagsCompleted > 0) {
                    tagsCompleted--;
                    if (t != text[i]) {
                        console.log("Error");
                        console.log(t);
                        console.log(text[i]);
                        console.log(text);
                    }
                }
                else {
                    let flag = true;
                    if (text[i] == '{') {
                        if (i >= "\\underline".length) {
                            let str = text.slice(i - "\\underline".length, i);
                            console.log(i - "\\underline".length);
                            console.log("\\underline".length);
                            if (str === "\\underline") {
                                tagListNew.push("\\underline{");
                                flag = false;
                            }
                            else {
                                console.log("debug2");
                                console.log(str);
                                console.log(text);
                                console.log(i);
                            }
                        }
                        else {
                            console.log("debug");
                            console.log(text);
                            console.log(i);
                        }
                        if (i > "\\textcolor{red}".length && flag)
                            if (text[i - 1] == '}') {
                                let j = i;
                                let s = "";
                                while (text[j] != '\\' && j >= 0) {
                                    s = text[j] + s;
                                    j--;
                                }
                                if (j == 0 && text[j] != '\\') { // bad
                                    flagPoss = false;
                                    console.log("bad" + "__" + i.toString());
                                    console.log(text);
                                    console.log(s);
                                }
                                else {
                                    // check correct
                                    console.log("checking");
                                    let s1 = s.slice(0, "textcolor".length);
                                    if (s1 === "textcolor") {
                                        s = "\\" + s;
                                        tagListNew.push(s);
                                    }
                                    else {
                                        console.log("different");
                                        console.log(s1);
                                        console.log(s);
                                    }
                                }
                            }
                    }
                    else {
                        console.log("bad2" + text + "__" + i.toString());
                        flagPoss = false;
                    }
                }
        }
    }
    return { out, flagPoss, L };
};
export { BeginString, EndString, FindOpenTags };