
import { EndString, BeginString, FindOpenTags } from "../math-quill-multyline-tools";

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
  expect(a?.out).toBe("\\underline{\\textcolor{purple}{");
  expect(a?.flagPoss).toBeTruthy();
  expect(a?.L).toBe(2);
});
