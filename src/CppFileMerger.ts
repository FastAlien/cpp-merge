import path from "path";
import fs from "fs";
import {EOL} from "os";

import CppFileParser from "./CppFileParser";
import {findFile, removeDoubleEmptyLines} from "./utils";

const headerFileExtensions = [".h", ".hpp"];
const sourceFileExtensions = [".c", ".cpp"];

export default class CppFileMerger {
    private readonly parser = new CppFileParser();
    private readonly includeDirectory: string | undefined;
    private readonly sourceDirectory: string | undefined;
    private readonly systemIncludes = new Set<string>();
    private readonly processedOnce = new Set<string>();

    public constructor(params: { includeDirectory?: string, sourceDirectory?: string } = {}) {
        this.includeDirectory = params.includeDirectory ? path.resolve(params.includeDirectory) : undefined;
        this.sourceDirectory = params.sourceDirectory ? path.resolve(params.sourceDirectory) : undefined;
    }

    public parse(filePath: string): string {
        this.reset();
        const content = this.parseFile(filePath);
        const currentDirectory = path.dirname(filePath);
        const sourceFilesContent = this.parseSourceFiles(currentDirectory);
        const systemIncludesContent = Array.from(this.systemIncludes.values())
            .sort((a, b) => a.localeCompare(b))
            .map(file => `#include <${file}>`)
            .join(EOL);

        const finalContent = [
            systemIncludesContent,
            content,
            sourceFilesContent
        ].join(EOL);

        return removeDoubleEmptyLines(finalContent);
    }

    private reset() {
        this.systemIncludes.clear();
        this.processedOnce.clear();
    }

    private parseFile(filePath: string): string {
        if (this.processedOnce.has(filePath)) {
            return "";
        }

        const fileContent = fs.readFileSync(filePath, "utf-8");
        const result = this.parser.parse(fileContent);
        result.systemIncludes.forEach(include => this.systemIncludes.add(include));
        const currentDirectory = path.dirname(filePath);
        const localIncludesContent = result.localIncludes.map(includeFilePath => this.parseIncludedFile(includeFilePath, currentDirectory));

        if (result.processOnce) {
            this.processedOnce.add(filePath);
        }

        return [
            ...localIncludesContent,
            result.content
        ].join(EOL);
    }

    private parseIncludedFile(filePath: string, currentDirectory: string): string {
        const searchFilePaths: string[] = [currentDirectory];
        if (this.includeDirectory) {
            searchFilePaths.push(this.includeDirectory);
        }

        const foundFilePath = findFile(filePath, searchFilePaths);
        if (!foundFilePath) {
            throw new Error(`Include file not found ${filePath}`);
        }

        return this.parseFile(foundFilePath);
    }

    private parseSourceFiles(currentDirectory: string): string {
        const contents: string[] = [];
        const searchDirectories: string[] = [currentDirectory];
        if (this.sourceDirectory) {
            searchDirectories.push(this.sourceDirectory);
        }

        this.processedOnce.forEach(filePath => {
            const fileName = path.basename(filePath);
            const extension = path.extname(fileName);
            if (!headerFileExtensions.find(headerFileExtension => headerFileExtension === extension)) {
                return;
            }

            const fileNameWithoutExtension = fileName.substr(0, fileName.length - extension.length);
            for (const sourceFileExtension of sourceFileExtensions) {
                const sourceFileName = `${fileNameWithoutExtension}${sourceFileExtension}`;
                const foundFilePath = findFile(sourceFileName, searchDirectories);
                if (!foundFilePath) {
                    continue;
                }

                const sourceFileContent = this.parseFile(foundFilePath);
                if (sourceFileContent) {
                    contents.push(sourceFileContent);
                }
            }
        });

        return contents.join(EOL);
    }
}
