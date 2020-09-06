export function removeDoubleEmptyLines(content: string): string {
    return content.replace(/(\n){2,}/g, "$1\n");
}