import {TraceError} from "../common/TraceError";
import {ErrorCause} from "../common/Types";

export class ParseError extends TraceError {
  public readonly file: string;

  public constructor(message: string, file: string, cause?: ErrorCause) {
    super(message, cause);
    this.file = file;
  }
}

export class FileReadError extends ParseError {
  public constructor(message: string, file: string, cause?: ErrorCause) {
    super(message, file, cause);
  }
}

export class IncludeFileNotFoundError extends ParseError {
  public readonly includeFile: string;

  public constructor(file: string, includeFile: string, cause?: ErrorCause) {
    super(`Include file '${includeFile}' not found`, file, cause);
    this.includeFile = includeFile;
  }
}
