import {TraceError} from "../common/TraceError";

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
