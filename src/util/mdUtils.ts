const IMAGE_REGEX = new RegExp(/!\[(.*)\]\((.+)\)/g);

export function sanitizeLatex(s: string): string {
    const double = /(\$\$)((.|\n)*?)(\$\$)/g;
    const single = /(\$)(.*?)(\$)/g;
    const doubleRegex = replaceLatex(double, s, "\\[", "\\]");
    const singleRegex = replaceLatex(single, doubleRegex, "\\(", "\\)");
    return singleRegex;
}

function replaceLatex(r: RegExp, s: string, front: string, back: string): string {
    return s.replace(r, (substring: string, f: string, middle: string, b: string) => [front, middle.trim(), back].join(''));
} 