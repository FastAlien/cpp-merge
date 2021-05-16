import { EOL } from "os";

const doubleLineRegExp = new RegExp(`(${EOL}){2,}`, 'g');
const doubleLineReplaceValue = `$1${EOL}`;

export function removeDoubleEmptyLines(content: string): string {
  return content.replace(doubleLineRegExp, doubleLineReplaceValue);
}

export function limitLineLength(text: string, lineLength: number): string[] {
  if (lineLength <= 0 || text.length <= lineLength) {
    return [text];
  }

  const resultLines: string[] = [];
  const textLines = text.split(EOL);

  for (const textLine of textLines) {
    let rest = textLine;

    while (rest.length > lineLength) {
      const part = rest.substring(0, lineLength + 1);
      const spacePosition = part.lastIndexOf(' ');
      if (spacePosition > 0) {
        resultLines.push(part.substring(0, spacePosition));
        rest = rest.substring(spacePosition + 1);
        continue;
      }

      resultLines.push(part.substring(0, lineLength));
      rest = rest.substring(lineLength);
    }

    resultLines.push(rest);
  }

  return resultLines;
}
