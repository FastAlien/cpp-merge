import fs from "fs";
import CppFileParser from "../../../src/parse/CppFileParser";

const parser = new CppFileParser();

describe("Parsing empty file", () => {
  const result = parser.parse("");

  test("Result is empty", () => {
    expect(result.processOnce).toBeFalsy();
    expect(result.localIncludes).toHaveLength(0);
    expect(result.systemIncludes).toHaveLength(0);
    expect(result.content).toEqual("");
  });
});

describe("Parsing header file", () => {
  const content = fs.readFileSync("test/data/parse/header.hpp", "utf-8");
  const result = parser.parse(content);

  test("Flag processOnce is enabled", () => {
    expect(result.processOnce).toBeTruthy();
  });

  test("#pragma once is removed from content", () => {
    expect(result.content).not.toContain("#pragma once");
  });

  test("Local includes are parsed", () => {
    expect(result.localIncludes).toHaveLength(3);
    expect(result.localIncludes).toContain("Test.hpp");
    expect(result.localIncludes).toContain("utils.hpp");
    expect(result.localIncludes).toContain("test/Test.h");
  });

  test("System includes are parsed", () => {
    expect(result.systemIncludes).toHaveLength(3);
    expect(result.systemIncludes).toContain("algorithm");
    expect(result.systemIncludes).toContain("cmath");
    expect(result.systemIncludes).toContain("iostream");
  });

  test("Includes are removed from content", () => {
    expect(result.content).not.toContain("#include");
  });
});

describe("Parsing source file", () => {
  const content = fs.readFileSync("test/data/parse/source.cpp", "utf-8");
  const result = parser.parse(content);

  test("Can be processed multiple times", () => {
    expect(result.processOnce).toBeFalsy();
  });

  test("Local includes are parsed", () => {
    expect(result.localIncludes).toHaveLength(3);
    expect(result.localIncludes).toContain("Test.hpp");
    expect(result.localIncludes).toContain("utils.hpp");
    expect(result.localIncludes).toContain("test/Test.h");
  });

  test("System includes are parsed", () => {
    expect(result.systemIncludes).toHaveLength(3);
    expect(result.systemIncludes).toContain("algorithm");
    expect(result.systemIncludes).toContain("cmath");
    expect(result.systemIncludes).toContain("iostream");
  });

  test("Includes are removed from content", () => {
    expect(result.content).not.toContain("#include");
  });
});
