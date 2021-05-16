export enum ErrorCode {
  ArgumentError = 1,
  ParseError = 2,
  WriteError = 3,
  UnexpectedError = 100
}

export default class CliError extends Error {
  public readonly errorCode: ErrorCode;

  public constructor(message: string, errorCode: ErrorCode) {
    super(message);
    this.errorCode = errorCode;
  }
}
