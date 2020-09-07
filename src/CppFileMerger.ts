import path from "path";
import fs from "fs";
import {EOL} from "os";

import CppFileParser from "./CppFileParser";
import {removeDoubleEmptyLines} from "./utils";

const headerFileExtensions = [".h", ".hpp"];
const sourceFileExtensions = [".c", ".cpp"];

export default class CppFileMerger {
    private readonly parser = new CppFileParser();
    private readonly includeDirectories: string[];
    private readonly sourceDirectory: string | undefined;
    private readonly systemIncludes = new Set<string>();
    private readonly processedOnce = new Set<string>();

    public constructor(params: { includeDirectory?: string, sourceDirectory?: string } = {}) {
        this.includeDirectories = params.includeDirectory ? [path.resolve(params.includeDirectory)] : [];
        this.sourceDirectory = params.sourceDirectory ? path.resolve(params.sourceDirectory) : undefined;
    }

    public merge(filePath: string): string {
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
        const searchFilePaths: string[] = [
            currentDirectory,
            ...this.includeDirectories
        ];

        for (const searchFilePath of searchFilePaths) {
            const includeFilePath = path.resolve(searchFilePath, filePath);
            if (fs.existsSync(includeFilePath)) {
                return this.parseFile(includeFilePath);
            }
        }

        throw new Error(`Include file not found ${filePath}`);
    }

    private parseSourceFiles(currentDirectory: string): string {
        const contents: string[] = [];

        this.processedOnce.forEach(filePath => {
            const fileName = path.basename(filePath);
            const extension = path.extname(fileName);
            if (!headerFileExtensions.find(headerFileExtension => headerFileExtension === extension)) {
                return;
            }

            const fileNameWithoutExtension = fileName.substr(0, fileName.length - extension.length);
            for (const sourceFileExtension of sourceFileExtensions) {
                const sourceFileName = `${fileNameWithoutExtension}${sourceFileExtension}`;
                const sourceFileContent = this.parseSourceFile(sourceFileName, currentDirectory);
                if (sourceFileContent) {
                    contents.push(sourceFileContent);
                }
            }
        });

        return contents.join(EOL);
    }

    private parseSourceFile(fileName: string, currentDirectory: string): string | undefined {
        const searchFilePaths: string[] = [currentDirectory];

        if (this.sourceDirectory) {
            searchFilePaths.push(this.sourceDirectory);
        }

        for (const searchFilePath of searchFilePaths) {
            const sourceFilePath = path.resolve(searchFilePath, fileName);
            if (fs.existsSync(sourceFilePath)) {
                return this.parseFile(sourceFilePath);
            }
        }
    }
}
