import CppFileMerger from "../../src/CppFileMerger";
import fs from "fs";

describe("Parsing source file with missing include file", () => {
    const merger = new CppFileMerger();

    test("Error is thrown", () => {
        expect(() => merger.parse("test/data/missingInclude/main.cpp"))
            .toThrowError("Include file not found hello.hpp");
    });
});

describe("Merging complex source file", () => {
    const merger = new CppFileMerger({
        includeDirectory: "test/data/complex/include",
        sourceDirectory: "test/data/complex/src"
    });
    const content = merger.parse("test/data/complex/main.cpp");

    test("Generated content equals expected", () => {
        const expected = fs.readFileSync("test/data/complex/expected.cpp", "utf-8");
        expect(content).toEqual(expected);
    });
});
