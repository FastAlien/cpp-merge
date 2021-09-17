import path from "path";
import fs from "fs";
import { FileReadError } from "./errors";

/**
 * Searches for file in specified directories.
 * @param fileName - Name of searched file.
 * @param searchDirectories - List of directories where file will be searched for.
 * @return Full path to the found file or `undefined` if file was not found in any of search directories.
 */
export function findFile(fileName: string, searchDirectories: string[]): string | undefined {
  for (const searchDirectory of searchDirectories) {
    const searchFilePath = path.resolve(searchDirectory, fileName);
    if (fs.existsSync(searchFilePath)) {
      return searchFilePath;
    }
  }
}

export function readFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (error) {
     const cause = error instanceof Error ? error : undefined;
     throw new FileReadError(`Error reading file '${filePath}'`, filePath, cause);
  }
}
