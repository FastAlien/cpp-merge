import {ErrorCause, TraceError} from "../errors";

export enum ErrorCode {
    ArgumentError = 1,
    ParseError = 2,
    WriteError = 3,
    UnexpectedError = 100
}

export class CliError extends TraceError {
    public readonly errorCode: ErrorCode;

    public constructor(message: string, errorCode: ErrorCode, cause?: ErrorCause) {
        super(message, cause);
        this.errorCode = errorCode;
    }
}
