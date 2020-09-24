import fs from "fs";
import os from "os";
import {Writable} from "stream";
import Cli from "../../../src/cli/Cli";
import {CliError, ErrorCode} from "../../../src/cli/error";
import {readFile} from "../../../src/utils";

describe("Parse incorrect arguments", () => {
    const notExistingInputFile = "nonExistingFile.cpp";
    const notExistingDirectory = "notExistingDirectory.hpp";
    const exitingInputFile = "test/data/parse/source.cpp";
    const cli = new Cli();

    test("When input file doesn't exists, then CliError is thrown", () => {
        expect(() => cli.run([notExistingInputFile]))
            .toThrowError(new CliError(`Input file '${notExistingInputFile}' doesn't exist`, ErrorCode.ArgumentError));
    });

    test("When include doesn't exists, then CliError is thrown", () => {
        const expectedError = new CliError(`Include directory '${notExistingDirectory}' doesn't exist`, ErrorCode.ArgumentError);

        expect(() => cli.run(["-i", notExistingDirectory, exitingInputFile]))
            .toThrowError(expectedError);

        expect(() => cli.run(["--include", notExistingDirectory, exitingInputFile]))
            .toThrowError(expectedError);
    });

    test("When source directory doesn't exists, CliError is thrown", () => {
        const expectedError = new CliError(`Source directory '${notExistingDirectory}' doesn't exist`, ErrorCode.ArgumentError);

        expect(() => cli.run(["-s", notExistingDirectory, exitingInputFile]))
            .toThrowError(expectedError);

        expect(() => cli.run(["--source", notExistingDirectory, exitingInputFile]))
            .toThrowError(expectedError);
    });
});

describe("Parse correct arguments", () => {
    const dataDirectory = "test/data/sourceInSubdirectories";
    const includeDirectory = `${dataDirectory}/include`;
    const sourceDirectory = `${dataDirectory}/src`;
    const inputFilePath = `${dataDirectory}/main.cpp`;
    const helpFilePath = "test/unit/cli/help.txt";

    test("When no arguments and options are passed, then help text is displayed on stdout", () => {
        const output = new StringWritableStream();
        const cli = new Cli(output);
        cli.run([]);
        const helpText = readFile(helpFilePath);
        expect(output.data).toBe(helpText);
    });

    test("When --help is passed, then help text is displayed on stdout", () => {
        const output = new StringWritableStream();
        const cli = new Cli(output);
        cli.run(["--help"]);
        const helpText = readFile(helpFilePath);
        expect(output.data).toBe(helpText);
    });

    test("When no -o/--output is passed, then output displayed on stdout", () => {
        const args = ["-i", includeDirectory, "-s", sourceDirectory, inputFilePath];
        const output = new StringWritableStream();
        const cli = new Cli(output);
        cli.run(args);
        const expected = readFile(`${dataDirectory}/expected.cpp`);
        expect(output.data).toStrictEqual(expected);
    });

    test("When -o is passed, then output stored in a file", () => {
        const tempDir = fs.mkdtempSync(`${os.tmpdir()}/cpp-merge-test-cli-Cli-${Date.now()}-`);
        const outputFilePath = `${tempDir}/output.tmp`;
        const args = ["-i", includeDirectory, "-s", sourceDirectory, "-o", outputFilePath, inputFilePath];
        const cli = new Cli();
        cli.run(args);
        const output = readFile(outputFilePath);
        const expected = readFile(`${dataDirectory}/expected.cpp`);
        expect(output).toStrictEqual(expected);
    });

    test("When --output is passed, then output stored in a file", () => {
        const tempDir = fs.mkdtempSync(`${os.tmpdir()}/cpp-merge-test-cli-Cli-${Date.now()}-`);
        const outputFilePath = `${tempDir}/output.tmp`;
        const args = ["-i", includeDirectory, "-s", sourceDirectory, "--output", outputFilePath, inputFilePath];
        const cli = new Cli();
        cli.run(args);
        const output = readFile(outputFilePath);
        const expected = readFile(`${dataDirectory}/expected.cpp`);
        expect(output).toStrictEqual(expected);
    });
});

class StringWritableStream extends Writable {
    public data = "";

    public constructor() {
        super();
    }

    public _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void) {
        this.data = this.data + chunk.toString();
        callback();
    }
}
