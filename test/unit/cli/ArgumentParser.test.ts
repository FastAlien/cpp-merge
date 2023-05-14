import ArgumentParser, {ParseResult} from "../../../src/cli/ArgumentParser";
import {OptionArgumentExpectedError, UnknownArgumentError, UnknownOptionError} from "../../../src/cli/Errors";

describe("ArgumentParser with one argument", () => {
  const parser = new ArgumentParser({programName: "test", description: "Test application"});
  parser.addArgument({
    name: "file",
    description: "Input file"
  });

  test("When parsing unknown option, then UnknownOptionError is thrown", () => {
    expect(() => parser.parseArguments(["-o"])).toThrowError(new UnknownOptionError("-o"));
    expect(() => parser.parseArguments(["--output"])).toThrowError(new UnknownOptionError("--output"));
  });

  test("When parsing one argument, then result contains argument with passed value", () => {
    const file = "input.cpp";
    const expected: ParseResult = {
      arguments: {file: file},
      options: {}
    };
    expect(parser.parseArguments([file])).toEqual(expected);
  });

  test("When parsing too many arguments, then UnknownArgumentError is thrown", () => {
    expect(() => parser.parseArguments(["input.cpp", "other"])).toThrowError(new UnknownArgumentError("other"));
  });
});

describe("ArgumentParser with argument without value", () => {
  const parser = new ArgumentParser({programName: "test", description: "Test application"});
  parser.addOption({
    name: "help",
    options: ["-h", "--help"],
    description: "Show help text."
  });

  test("When parsing empty arguments, then option in result is undefined", () => {
    const parsedArguments = parser.parseArguments([]);
    expect(parsedArguments.options["help"]).toBeUndefined();
  });

  test("When parsing short option, then option in result is defined", () => {
    const parsedArguments = parser.parseArguments(["-h"]);
    expect(parsedArguments.options["help"]).toBeDefined();
  });

  test("When parsing long option, then option in result is defined", () => {
    const parsedArguments = parser.parseArguments(["--help"]);
    expect(parsedArguments.options["help"]).toBeDefined();
  });
});

describe("ArgumentParser with one option with value", () => {
  const parser = new ArgumentParser({programName: "test", description: "Test application"});
  parser.addOption({
    name: "include",
    options: ["-i", "--include"],
    description: "Path to additional directory where header files are located.",
    value: {name: "path"}
  });

  test("When parsing option without argument, then OptionArgumentExpectedError is thrown", () => {
    expect(() => parser.parseArguments(["-i"])).toThrowError(new OptionArgumentExpectedError("-i"));
    expect(() => parser.parseArguments(["--include"])).toThrowError(new OptionArgumentExpectedError("--include"));
  });

  test("When parsing unknown option, then UnknownOptionError is thrown", () => {
    expect(() => parser.parseArguments(["-o"])).toThrowError(new UnknownOptionError("-o"));
    expect(() => parser.parseArguments(["--output"])).toThrowError(new UnknownOptionError("--output"));
  });

  test("When parsing option with argument, then result contains option with passed value", () => {
    const includeDirectory = "some/path/to/directory";
    const expected: ParseResult = {
      arguments: {},
      options: {include: includeDirectory}
    };
    expect(parser.parseArguments(["-i", includeDirectory])).toEqual(expected);
    expect(parser.parseArguments(["--include", includeDirectory])).toEqual(expected);
  });
});

describe("ArgumentParser with argument and option", () => {
  const parser = new ArgumentParser({programName: "test", description: "Test application"});
  parser.addArgument({
    name: "file",
    description: "Input file"
  });

  parser.addOption({
    name: "include",
    options: ["-i", "--include"],
    description: "Path to additional directory where header files are located.",
    value: {name: "path"}
  });

  test("When parsing empty arguments and options, then arguments and options in result are empty", () => {
    const expected: ParseResult = {arguments: {}, options: {}};
    expect(parser.parseArguments([])).toEqual(expected);
  });

  test("When parsing one argument, then result contains argument with passed value", () => {
    const file = "input.cpp";
    const expected: ParseResult = {
      arguments: {file: file},
      options: {}
    };
    expect(parser.parseArguments([file])).toEqual(expected);
  });

  test("When parsing too many arguments, then UnknownArgumentError is thrown", () => {
    expect(() => parser.parseArguments(["input.cpp", "other"])).toThrowError(new UnknownArgumentError("other"));
  });

  test("When parsing option without argument, then OptionArgumentExpectedError is thrown", () => {
    expect(() => parser.parseArguments(["-i"])).toThrowError(new OptionArgumentExpectedError("-i"));
    expect(() => parser.parseArguments(["--include"])).toThrowError(new OptionArgumentExpectedError("--include"));
  });

  test("When parsing argument and option with argument, then result contains argument and option with passed values", () => {
    const file = "input.cpp";
    const includeDirectory = "some/path/to/directory";
    const expected: ParseResult = {
      arguments: {file: file},
      options: {include: includeDirectory}
    };
    expect(parser.parseArguments(["-i", includeDirectory, file])).toEqual(expected);
    expect(parser.parseArguments(["--include", includeDirectory, file])).toEqual(expected);
    expect(parser.parseArguments([file, "-i", includeDirectory])).toEqual(expected);
    expect(parser.parseArguments([file, "--include", includeDirectory])).toEqual(expected);
  });
});
