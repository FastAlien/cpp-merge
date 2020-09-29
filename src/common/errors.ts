import {EOL} from "os";

export type ErrorCause = Error | string;

export class TraceError extends Error {
    public readonly cause?: Error;

    public constructor(message: string, cause?: ErrorCause) {
        super(message);
        if (cause) {
            this.cause = cause instanceof Error ? cause : new Error(cause);
        }
    }
}

export function formatErrorStack(error: Error | string): string {
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

    return error || '';
}
