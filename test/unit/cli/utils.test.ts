import {EOL} from "os";
import {limitLineLength} from "../../../src/cli/utils";

describe("limitLineWidth", () => {
    const text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

    test("When parsing string with length < line width, then no EOL is added", () => {
        expect(limitLineLength(text, text.length + 1).join(EOL))
            .toBe(text);
    });

    test("When parsing string with length == line width, then no EOL is added", () => {
        expect(limitLineLength(text, text.length).join(EOL))
            .toBe(text);
    });

    test("When parsing string with length > max line length, then line length in result is less than or equal to limit", () => {
        expect(limitLineLength(text, 70).join(EOL))
            .toBe(`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do${EOL}eiusmod tempor incididunt ut labore et dolore magna aliqua.`);

        expect(limitLineLength(text, 25).join(EOL))
            .toBe(`Lorem ipsum dolor sit${EOL}amet, consectetur${EOL}adipiscing elit, sed do${EOL}eiusmod tempor incididunt${EOL}ut labore et dolore magna${EOL}aliqua.`);
    });

    test("When parsing string without spaces, then max line length in result is equal to limit", () => {
        const textWithoutSpaces = "Loremipsumdolorsitametconsecteturadipiscingelitseddoeiusmodtemporincididuntutlaboreetdoloremagnaaliqua.";

        expect(limitLineLength(textWithoutSpaces, 30).join(EOL))
            .toBe(`Loremipsumdolorsitametconsecte${EOL}turadipiscingelitseddoeiusmodt${EOL}emporincididuntutlaboreetdolor${EOL}emagnaaliqua.`);

        expect(limitLineLength(textWithoutSpaces, 10).join(EOL))
            .toBe(`Loremipsum${EOL}dolorsitam${EOL}etconsecte${EOL}turadipisc${EOL}ingelitsed${EOL}doeiusmodt${EOL}emporincid${EOL}iduntutlab${EOL}oreetdolor${EOL}emagnaaliq${EOL}ua.`);
    });

    test("When parsing string with it's already broken at correct places, then result it's not changed", () => {
        const textWithEOLs = `Loremipsumdolorsitametconsecte${EOL}turadipiscingelitseddoeiusmodt${EOL}emporincididuntut labore et${EOL}dolore magna aliqua.`;
        expect(limitLineLength(textWithEOLs, 30).join(EOL))
            .toBe(textWithEOLs);
    });

    test("When parsing string with multiple line breaks in line, then result respect those breaks", () => {
        const textWithEOLs = `${EOL}Lore${EOL}mipsum${EOL}dolorsitametco sectet. adipisc ingeli seddoei smodt.`;

        expect(limitLineLength(textWithEOLs, 30).join(EOL))
            .toBe(`${EOL}Lore${EOL}mipsum${EOL}dolorsitametco sectet. adipisc${EOL}ingeli seddoei smodt.`);

        expect(limitLineLength(textWithEOLs, 15).join(EOL))
            .toBe(`${EOL}Lore${EOL}mipsum${EOL}dolorsitametco${EOL}sectet. adipisc${EOL}ingeli seddoei${EOL}smodt.`);
    });
});
