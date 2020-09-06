#!/usr/bin/env node
import CppFileMerger from "./CppFileMerger";
import GetOpt from "node-getopt";

enum ExitCode {
    NO_MAIN_CPP = 1
}

const options = GetOpt.create([
    ["h", "help", "Display help text"],
    ["i", "include=DIR", "Directory containing header files"],
    ["s", "source=DIR", "Directory containing source files"],
    ["m", "main=FILE", "Main cpp file"]
]).bindHelp();

const parsedOptions = options.parseSystem();

function getOption(key: string): string | undefined {
    const value = parsedOptions.options[key];
    if (typeof value === "string") {
        return value;
    }
}

const filePath = getOption("m");
if (!filePath) {
    options.showHelp();
    process.exit(ExitCode.NO_MAIN_CPP);
}

const includeDirectory = getOption("i");
const sourceDirectory = getOption("s");

const fileMerger = new CppFileMerger({
    includeDirectory: includeDirectory,
    sourceDirectory: sourceDirectory
});
const content = fileMerger.merge(filePath);
console.log(content);
