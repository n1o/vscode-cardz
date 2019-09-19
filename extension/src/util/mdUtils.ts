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