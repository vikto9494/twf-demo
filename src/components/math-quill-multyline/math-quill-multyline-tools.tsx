const EndString = (text: string) => {
  let TagList = [];
  for (let i = 0; i < text.length; i++) {
    switch (text[i]) {
      case "{":
        TagList.push("}");
        break;
      case "[":
        TagList.push("]");
        break;
      case "(":
        TagList.push(")");
        break;
      case "}":
      case "]":
      case ")":
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

const BeginString = (text: string) => {
  let TagList = [];
  for (let i = text.length - 1; i >= 0; i--) {
    switch (text[i]) {
      case "}":
        TagList.push("{");
        break;
      case "]":
        TagList.push("[");
        break;
      case ")":
        TagList.push("(");
        break;
      case "{":
      case "[":
      case "(":
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
    out += TagList[i];
  }
  return TagList;
};

const FindOpenTags = (tagList: string[], text: string) => {
  let tagListNew = [] as string[];
  // Possibility flag
  let flagPoss = true;
  let tagsCompleted = 0;
  console.log("Start");
  // scan text
  for (let i = text.length - 1; i >= 0; i--) {
    if (tagList.length == 0) {
      let out = "";
      console.log(tagListNew);
      for (let i = 0; i < tagListNew.length; i++) {
        out = tagListNew[i] + out;
      }
      console.log(flagPoss);
      let L = tagListNew.length;
      return { out, flagPoss, L };
    }
    // if } -- push
    // if { -- pop
    switch (text[i]) {
      case "}":
        tagList.push("{");
        tagsCompleted++;
        break;
      case "]":
        tagList.push("[");
        tagsCompleted++;
        break;
      case ")":
        tagList.push("(");
        tagsCompleted++;
        break;
      case "{":
      case "[":
      case "(":
        let t = tagList.pop();
        // some completed? tags
        if (tagsCompleted > 0) {
          tagsCompleted--;
          if (t != text[i]) {
            // completed tag is not completed
            console.log("Error");
            console.log(t);
            console.log(text[i]);
            console.log(text);
          }
        } else {
          console.log("here");
          // it`s our tag
          let flag = true;
          if (text[i] == "{") {
            // is underlined tag?
            if (i >= "\\underline".length) {
              let str = text.slice(i - "\\underline".length, i);
              console.log(i - "\\underline".length);
              console.log("\\underline".length);
              if (str === "\\underline") {
                // yes!
                tagListNew.push("\\underline{");
                flag = false;

              } else {
                // no
                console.log("debug2");
                console.log(str);
                console.log(text);
                console.log(i);
              }
            } else {
              // no
              console.log("debug");
              console.log(text);
              console.log(i);

            }
            // is textcolor tag?
            if (i >= "\\textcolor{red}".length && flag)
              if (text[i - 1] == "}") {
                let j = i;
                let s = "";
                while (text[j] != "\\" && j >= 0) {
                  s = text[j] + s;
                  j--;
                }
                if (j == 0 && text[j] != "\\") {// bad
                  flagPoss = false;
                  console.log("bad" + "__" + i.toString());
                  console.log(text);
                  console.log(s);
                } else {
                  // yes?
                  // check correct
                  console.log("checking");
                  let s1 = s.slice(0, "textcolor".length);
                  if (s1 === "textcolor") {
                    s = "\\" + s;
                    tagListNew.push(s);
                  } else {
                    // no((
                    console.log("different");
                    console.log(s1);
                    console.log(s);

                  }
                }

              }
          } else {
            console.log("bad2" + text + "__" + i.toString());
            flagPoss = false;
          }
        }
    }
  }
};
const FindChangedText = (text0: string, text1: string) => {

  let newText = text1;
  let oldText = text0;

  if (newText === "") {
    return oldText;
  }
  if (oldText === "") {
    return newText;
  }
  if (newText && oldText) {
    let h0 = 0;
    let h1 = 0;
    let t0 = oldText.length - 1;
    let t1 = newText.length - 1;
    while (h0 != t0 && h1 != t1) {
      if (oldText[h0] === newText[h1]) {
        h0++;
        h1++;
        if (h0 == t0 || h1 == t1) {
          break;
        }
      }
      if (oldText[t0] === newText[t1]) {
        t0--;
        t1--;
      }
      if (oldText[t0] !== newText[t1] && oldText[t0] !== newText[t1])
        return newText.substr(h1, t1 - h1 + 1);
    }
    if (h0 == t0 && h1 == t1) {
      return "";
    }
    if (h0 == t0) {
      if (oldText[h0] !== newText[h1] && oldText[t0] !== newText[t1]) {
        return newText.substr(h1, t1 - h1 + 1);
      }
      if (oldText[h0] === newText[h1]) {
        return newText.substr(h1 + 1, t1 - h1 + 1);
      }
      if (oldText[t0] === newText[t1]) {
        return newText.substr(h1, t1 - h1);
      }
    }
    if (h1 == t1) {
      if (oldText[h0] !== newText[h1] && oldText[t0] !== newText[t1]) {
        return oldText.substr(h0, t0 - h0 + 1);
      }
      if (oldText[h0] === newText[h1]) {
        return oldText.substr(h0 + 1, t0 - h0 + 1);
      }
      if (oldText[t0] === newText[t1]) {
        return oldText.substr(h0, t0 - h0);
      }
    }

  }
  if (newText) {
    return newText;
  }
  if (oldText) {
    return oldText;
  }
  return "";
};
export { BeginString, EndString, FindOpenTags, FindChangedText };
