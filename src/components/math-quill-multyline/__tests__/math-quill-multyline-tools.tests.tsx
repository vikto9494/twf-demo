
import { EndString, BeginString, FindOpenTags, FindChangedText } from "../math-quill-multyline-tools";

// EndString tests
it('Endstring -- in: "(" ', () => {
  expect(EndString("(")).toBe(")");
});

it('Endstring -- in: "[" ', () => {
  expect(EndString("[")).toBe("]");
});
it('Endstring -- in: "{" ', () => {
  expect(EndString("{")).toBe("}");
});
it('Endstring -- in: "({" ', () => {
  expect(EndString("({")).toBe("})");
});
it('Endstring -- in: "([" ', () => {
  expect(EndString("([")).toBe("])");
});
it('Endstring -- in: "((" ', () => {
  expect(EndString("((")).toBe("))");
});
it('Endstring -- in: "({[" ', () => {
  expect(EndString("({[")).toBe("]})");
});
// BeginString tests
it('BeginString test1', () => {
  expect(BeginString("}")).toStrictEqual(["{"]);
});

it('BeginString test1', () => {
  expect(BeginString("]")).toStrictEqual(["["]);
});

it('BeginString test1', () => {
  expect(BeginString(")")).toStrictEqual(["("]);
});

it('BeginString test1', () => {
  expect(BeginString("})")).toStrictEqual(["(", "{"]);
});

it('BeginString test1', () => {
  expect(BeginString(")}]")).toStrictEqual(["[", "{", "("]);
});
// FindOpenTags tests    {out: "\\underline{\\textcolor{purple}{", flagPoss: true, L: 2}
it('FindOpenTags -- test1', () => {
  let a = FindOpenTags(["{", "{"], "\\textcolor{purple}{3+4\\underline{3+");
  expect(a).toBeDefined();
  expect(a?.out).toBe("\\textcolor{purple}{\\underline{");
  expect(a?.flagPoss).toBeTruthy();
  expect(a?.L).toBe(2);
});
it('FindOpenTags -- test2', () => {
  let a = FindOpenTags(["{"], "\\textcolor{red}{\\textcolor{purple}{=}P\\left(m\\right)\\cdot ");
  expect(a).toBeDefined();
  expect(a?.out).toBe("\\textcolor{red}{");
  expect(a?.flagPoss).toBeTruthy();
  expect(a?.L).toBe(1);
});
// FindChangedText
it('FindChangedText -- test1', () => {
  let a = FindChangedText("abcef", "bcef");
  expect(a).toBe("a");
  a = FindChangedText("bcef", "bcef");
  expect(a).toBe("");
  a = FindChangedText("cef", "bcef");
  expect(a).toBe("b");
  a = FindChangedText("ef", "bcef");
  expect(a).toBe("bc");
  a = FindChangedText("f", "bcef");
  expect(a).toBe("bce");
  a = FindChangedText("", "bcef");
  expect(a).toBe("bcef");
});
