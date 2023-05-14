import {EOL} from "os";
import {TraceError} from "./TraceError";

export function formatErrorStack(error: Error | string | unknown): string {
  if (error instanceof TraceError && error.cause) {
    return [
      error.stack || error.message,
      "caused by",
      formatErrorStack(error.cause)
    ].join(EOL);
  }

  if (error instanceof Error) {
    return error.stack || error.message;
  }

  return `${error}`;
}
