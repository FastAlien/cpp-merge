import fs from "fs";
import CppFileMerger from "../../../src/parse/CppFileMerger";
import { IncludeFileNotFoundError } from "../../../src/parse/errors";

describe("Parsing source file with missing include file", () => {
  const merger = new CppFileMerger();

  test("Error is thrown", () => {
    expect(() => merger.parse("test/data/missingInclude/main.cpp"))
      .toThrowError(IncludeFileNotFoundError);
  });
});

describe("Merging complex source file", () => {
  const dataDirectory = "test/data/complex";
  const merger = new CppFileMerger({
    includeDirectory: `${dataDirectory}/include`,
    sourceDirectory: `${dataDirectory}/src`
  });
  const content = merger.parse(`${dataDirectory}/main.cpp`);

  test("Generated content equals expected", () => {
    const expected = fs.readFileSync(`${dataDirectory}/expected.cpp`, "utf-8");
    expect(content).toEqual(expected);
  });
});

describe("Merging source files in subdirectories", () => {
  const dataDirectory = "test/data/sourceInSubdirectories";
  const merger = new CppFileMerger({
    includeDirectory: `${dataDirectory}/include`,
    sourceDirectory: `${dataDirectory}/src`
  });
  const content = merger.parse(`${dataDirectory}/main.cpp`);

  test("Generated content equals expected", () => {
    const expected = fs.readFileSync(`${dataDirectory}/expected.cpp`, "utf-8");
    expect(content).toEqual(expected);
  });
});

describe("Merging files with circular dependencies", () => {
  const dataDirectory = "test/data/circularDependencies";
  const merger = new CppFileMerger();
  const content = merger.parse(`${dataDirectory}/main.cpp`);

  test("Generated content equals expected", () => {
    const expected = fs.readFileSync(`${dataDirectory}/expected.cpp`, "utf-8");
    expect(content).toEqual(expected);
  });
});

describe("Merging source with header including another header from include directory", () => {
  const dataDirectory = "test/data/headerIncludeHeaderInSubdirectory";
  const merger = new CppFileMerger({
    includeDirectory: `${dataDirectory}/include`
  });
  const content = merger.parse(`${dataDirectory}/main.cpp`);

  test("Generated content equals expected", () => {
    const expected = fs.readFileSync(`${dataDirectory}/expected.cpp`, "utf-8");
    expect(content).toEqual(expected);
  });
});
