export function findAll(r: RegExp, s: string): RegExpExecArray[] {
    const res = r.exec(s);
    if(res) {
        return [res, ...findAll(r,s)];
    } else {
        return [];
    }
}

export function findAllImagePaths(s: string): string[] {
    const imageRegex = new RegExp(/!\[(.+)\]\((.+)\)/g);
    return findAll(imageRegex, s).map(exp => exp[2]);
}

export function sanitizeLatex(s: string): string {
    const double = /(\$\$)(.*?)(\$\$)/g;
    const doubleReplace = /(_\!_\!_)(.*?)(_\!_\!_)/g;
    const single = /(\$)(.*?)(\$)/g;
    const doubleRegex = replaceLatex(double, s, "_!_!_", "_!_!_");
    const singleRegex = replaceLatex(single, doubleRegex, "[$]", "[/$]");
    return replaceLatex(doubleReplace, singleRegex, "[$$]", "[/$$]");
}

function replaceLatex(r: RegExp, s: string, front: string, back: string): string {
    return s.replace(r, (substring: string, f: string, middle: string, b: string) => [front, middle.trim(), back].join(''));
} 