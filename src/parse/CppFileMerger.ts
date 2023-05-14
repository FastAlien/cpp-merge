import path from "path";
import {EOL} from "os";
import {removeDoubleEmptyLines} from "../common/StringUtils";
import CppFileParser from "./CppFileParser";
import {IncludeFileNotFoundError} from "./Errors";
import {findFile, readFile} from "./FileUtils";

const headerFileExtensions = [".h", ".hpp"];
const sourceFileExtensions = [".c", ".cpp"];

export default class CppFileMerger {
  private readonly parser = new CppFileParser();
  private readonly includeDirectory: string | undefined;
  private readonly sourceDirectory: string | undefined;
  private readonly systemIncludes = new Set<string>();
  private readonly processedOnce = new Set<string>();
  private workingDirectory = "";

  public constructor(params: { includeDirectory?: string, sourceDirectory?: string } = {}) {
    this.includeDirectory = params.includeDirectory ? path.resolve(params.includeDirectory) : undefined;
    this.sourceDirectory = params.sourceDirectory ? path.resolve(params.sourceDirectory) : undefined;
  }

  public parse(filePath: string): string {
    this.systemIncludes.clear();
    this.processedOnce.clear();
    this.workingDirectory = path.dirname(filePath);
    const content = this.parseFile(filePath);
    const sourceFilesContent = this.parseSourceFiles();
    const systemIncludesContent = Array.from(this.systemIncludes.values())
      .sort((a, b) => a.localeCompare(b))
      .map(file => `#include <${file}>`)
      .join(EOL);

    const finalContent = [
      systemIncludesContent,
      content,
      sourceFilesContent
    ]
      .filter(content => !!content)
      .join(EOL);

    return removeDoubleEmptyLines(finalContent);
  }

  private parseFile(filePath: string): string {
    if (this.processedOnce.has(filePath)) {
      return "";
    }

    const fileContent = readFile(filePath);
    const result = this.parser.parse(fileContent);
    result.systemIncludes.forEach(include => this.systemIncludes.add(include));

    if (result.processOnce) {
      this.processedOnce.add(filePath);
    }

    const currentDirectory = path.dirname(filePath);
    const localIncludesContent = result.localIncludes.map(includeFilePath => {
      return this.parseIncludedFile(includeFilePath, currentDirectory, filePath)
    });

    return [
      ...localIncludesContent,
      result.content
    ].join(EOL);
  }

  private parseIncludedFile(filePath: string, currentDirectory: string, processedFilePath: string): string {
    const searchFilePaths: string[] = [currentDirectory];
    if (this.includeDirectory) {
      searchFilePaths.push(this.includeDirectory);
    }

    const foundFilePath = findFile(filePath, searchFilePaths);
    if (!foundFilePath) {
      throw new IncludeFileNotFoundError(processedFilePath, filePath);
    }

    return this.parseFile(foundFilePath);
  }

  private parseSourceFiles(): string {
    const contents: string[] = [];
    const searchDirectories: string[] = [this.workingDirectory];
    if (this.sourceDirectory) {
      searchDirectories.push(this.sourceDirectory);
    }

    this.processedOnce.forEach(filePath => {
      const relativeFilePath = this.getHeaderRelativePath(filePath);
      const extension = path.extname(relativeFilePath);
      if (!headerFileExtensions.find(headerFileExtension => headerFileExtension === extension)) {
        return;
      }

      const relativeFilePathWithoutExtension = relativeFilePath.substr(0, relativeFilePath.length - extension.length);
      for (const sourceFileExtension of sourceFileExtensions) {
        const sourceFileName = `${relativeFilePathWithoutExtension}${sourceFileExtension}`;
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

  private getHeaderRelativePath(filePath: string) {
    const fileDirectory = path.dirname(filePath);
    const baseDirectory = this.includeDirectory && fileDirectory.startsWith(this.includeDirectory) ? this.includeDirectory : this.workingDirectory;
    return path.relative(baseDirectory, filePath);
  }
}
