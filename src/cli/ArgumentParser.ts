import assert from "assert";
import { TraceError } from "../common/errors";
import HelpFormatter from "./HelpFormatter";
import { Argument, Option } from "./types";

export class ArgumentError extends TraceError {
  public readonly argument: string;

  public constructor(message: string, argument: string) {
    super(message);
    this.argument = argument;
  }
}

export class UnknownArgumentError extends ArgumentError {
  public constructor(argument: string, message = `Unknown argument '${argument}'`) {
    super(message, argument);
  }
}

export class UnknownOptionError extends ArgumentError {
  public constructor(argument: string, message = `Unknown option '${argument}'`) {
    super(message, argument);
  }
}

export class OptionArgumentExpectedError extends ArgumentError {
  public constructor(option: string, message = `Option '${option}' requires a value`) {
    super(message, option);
  }
}

export type ParseResult = {
  arguments: ParsedArguments;
  options: ParsedOptions;
};

type ParsedArguments = {
  [name: string]: string | undefined;
};

type ParsedOptions = {
  [name: string]: string | undefined;
};

export default class ArgumentParser {
  private readonly helpFormatter = new HelpFormatter();
  private readonly arguments: Argument[] = [];
  private readonly options: Option[] = [];
  private readonly programName;
  private readonly description;

  public constructor(params: { programName: string, description: string }) {
    this.programName = params.programName;
    this.description = params.description;
  }

  public addArgument(argument: Argument): void {
    this.arguments.push(argument);
  }

  public addOption(option: Option): void {
    this.options.push(option);
  }

  public parseArguments(args: string[]): ParseResult {
    const argumentsToParse = [...args];
    const parsedArguments: ParsedArguments = {};
    const parsedOptions: ParsedOptions = {};
    let argumentIndex = 0;

    while (argumentsToParse.length > 0) {
      const argument = argumentsToParse.shift();
      assert(argument);
      if (this.isOption(argument)) {
        const { name, value } = this.parseOption(argument, argumentsToParse);
        parsedOptions[name] = value;
        continue;
      }

      if (argumentIndex >= this.arguments.length) {
        throw new UnknownArgumentError(argument);
      }

      const argumentName = this.arguments[argumentIndex].name;
      parsedArguments[argumentName] = argument;
      ++argumentIndex;
    }

    return {
      arguments: parsedArguments,
      options: parsedOptions
    };
  }

  private isOption(argument: string) {
    return argument.startsWith("-");
  }

  private parseOption(argument: string, args: string[]): { name: string, value: string } {
    const option = this.findOption(argument);
    if (!option) {
      throw new UnknownOptionError(argument);
    }

    if (!option.value) {
      return { name: option.name, value: "" };
    }

    const value = args.shift();
    if (!value) {
      throw new OptionArgumentExpectedError(argument);
    }
    return { name: option.name, value: value };
  }

  private findOption(option: string): Option | undefined {
    return this.options.find((opt: Option) => {
      return opt.options.find(o => o === option);
    });
  }

  public formatHelp(): string {
    return this.helpFormatter.formatHelp(this.programName, this.description, this.arguments, this.options);
  }
}
