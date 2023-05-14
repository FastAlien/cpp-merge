import {ErrorCause} from "./Types";

export class TraceError extends Error {
  public readonly cause?: Error;

  public constructor(message: string, cause?: ErrorCause) {
    super(message);
    if (cause) {
      this.cause = cause instanceof Error ? cause : new Error(cause);
    }
  }
}

