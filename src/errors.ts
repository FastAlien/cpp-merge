export class ParseError extends Error {
    public readonly file: string;

    public constructor(message: string, file: string) {
        super(message);
        this.file = file;
    }
}

export class IncludeFileNotFoundError extends ParseError {
    public readonly includeFile: string;

    public constructor(file: string, includeFile: string) {
        super("Include file not found", file);
        this.includeFile = includeFile;
    }
}
