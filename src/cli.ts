#!/usr/bin/env node
import fs from "fs";
import {ArgumentParser} from "argparse";
import CppFileMerger from "./CppFileMerger";
import {IncludeFileNotFoundError, ParseError} from "./errors";

enum ErrorCode {
    InvalidArgument = 1,
    ParseError = 2,
    WriteError = 3
}

class CliArgumentParser extends ArgumentParser {
    public error(error: string | Error) {
        this.exit(ErrorCode.InvalidArgument, `Error: ${error}\n`);
    }
}

const parser = new CliArgumentParser({
    prog: "cpp-merge",
    description: "A tool to produce single file from multiple C/C++ files. By default the produced content is " +
        "displayed on the standard output. To store it in a file use option -o or --output.",
    add_help: true
});

parser.add_argument('file', {
    help: "Source file",
    metavar: "<file>"
});

parser.add_argument('-i', '--include', {
    help: "Directory containing header files",
    metavar: "<directory>"
});

parser.add_argument('-s', '--source', {
    help: "Directory containing source files",
    metavar: "<directory>"
});

parser.add_argument('-o', '--output', {
    help: "Store output in a file, instead of displaying it on the standard output.",
    metavar: "<file>"
});

const {
    file: filePath,
    include: includeDirectory,
    source: sourceDirectory,
    output: outputFilePath
} = parser.parse_args();

if (!fs.existsSync(filePath)) {
    console.error(`Source file "${filePath}" not found.`);
    process.exit(ErrorCode.InvalidArgument);
}

if (includeDirectory && !fs.existsSync(includeDirectory)) {
    console.error(`Include directory "${includeDirectory}" not found.`);
    process.exit(ErrorCode.InvalidArgument);
}

if (sourceDirectory && !fs.existsSync(sourceDirectory)) {
    console.error(`Source directory "${sourceDirectory}" not found.`);
    process.exit(ErrorCode.InvalidArgument);
}

const fileMerger = new CppFileMerger({includeDirectory, sourceDirectory});

try {
    const content = fileMerger.parse(filePath);

    if (!outputFilePath) {
        console.log(content);
        process.exit();
    }

    try {
        fs.writeFileSync(outputFilePath, content)
    } catch (error) {
        console.error(`Error writing output to file "${outputFilePath}": ${error.message}`);
        process.exit(ErrorCode.WriteError);
    }
} catch (error) {
    if (error instanceof ParseError) {
        const message = error instanceof IncludeFileNotFoundError ? `Include "${error.includeFile}" not found` : error.message;
        console.error(`Error parsing file "${error.file}": ${message}`);
    } else {
        console.error(`Error parsing file: ${error.message}`);
    }
    process.exit(ErrorCode.ParseError);
}