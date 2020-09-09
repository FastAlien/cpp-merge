#!/usr/bin/env node
import fs from "fs";
import {ArgumentParser} from "argparse";
import CppFileMerger from "./CppFileMerger";

const parser = new ArgumentParser({
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
    process.exit(1);
}

if (includeDirectory && !fs.existsSync(includeDirectory)) {
    console.error(`Include directory "${includeDirectory}" not found.`);
    process.exit(1);
}

if (sourceDirectory && !fs.existsSync(sourceDirectory)) {
    console.error(`Source directory "${sourceDirectory}" not found.`);
    process.exit(1);
}

const fileMerger = new CppFileMerger({includeDirectory, sourceDirectory});
const content = fileMerger.parse(filePath);

if (outputFilePath) {
    fs.writeFileSync(outputFilePath, content)
} else {
    console.log(content);
}