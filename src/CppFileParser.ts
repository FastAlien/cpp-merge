export type ParseResult = {
    processOnce: boolean;
    localIncludes: string[];
    systemIncludes: string[];
    content: string;
}

export default class CppFileParser {
    private static readonly localIncludeRegExp = /^#include "([^"]+)"/;
    private static readonly systemIncludeRegExp = /^#include <([^>]+)>/;
    private static readonly pragmaOnceRegExp  = /^#pragma once/;

    public parse(fileContent: string): ParseResult {
        const fileLines = fileContent.split("\n");
        const content: string[] = [];
        const systemIncludes = new Set<string>();
        const localIncludes = new Set<string>();
        let pragmaOnceFound = false;
        let emptyCount = 0;

        for (const line of fileLines) {
            if (CppFileParser.pragmaOnceRegExp.test(line)) {
                pragmaOnceFound = true;
                continue;
            }

            const systemInclude = CppFileParser.systemIncludeRegExp.exec(line)?.[1];
            if (systemInclude) {
                systemIncludes.add(systemInclude);
                continue;
            }

            const localInclude = CppFileParser.localIncludeRegExp.exec(line)?.[1];
            if (localInclude) {
                localIncludes.add(localInclude);
                continue;
            }

            if (line) {
                emptyCount = 0;
            } else if (++emptyCount > 1) {
                continue;
            }

            content.push(line);
        }

        return {
            processOnce: pragmaOnceFound,
            localIncludes: Array.from(localIncludes.values()),
            systemIncludes: Array.from(systemIncludes.values()),
            content: content.join("\n")
        };
    }
}
