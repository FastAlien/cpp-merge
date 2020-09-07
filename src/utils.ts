import {EOL} from "os";

const doubleLineRegExp = new RegExp(`(${EOL}){2,}`, 'g');
const doubleLineReplaceValue = `$1${EOL}`;

export function removeDoubleEmptyLines(content: string): string {
    return content.replace(doubleLineRegExp, doubleLineReplaceValue);
}