import { compile } from "nunjucks";

const IMAGE_REGEX = new RegExp(/!\[(.*)\]\((.+)\)/g);

export function findAll(r: RegExp, s: string): RegExpExecArray[] {
    const res = r.exec(s);
    if(res) {
        return [res, ...findAll(r,s)];
    } else {
        return [];
    }
}

export function findAllImagePaths(s: string): string[] {
    const result: string[] = [];

    let match: RegExpExecArray| null;
    while((match = IMAGE_REGEX.exec(s)) != null) {
        result.push(match[2]);
    }
    return result;
}

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