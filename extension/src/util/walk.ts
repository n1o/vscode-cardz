import { promises } from 'fs';
import { join, sep } from 'path';

export async function walkDirectory(rootPath: string): Promise<string[]> {
 
    const stat = await promises.stat(rootPath);

    if (stat.isDirectory()) {
        const children = await promises.readdir(rootPath);
        const res = await Promise.all(children.map(child => walkDirectory(join(rootPath, child))));
        
        const reduced = res.reduce((pre, cur) => [...pre, ...cur]);
        return reduced;
    } else {
        return [rootPath];
    }
}

export function flashCardsDirectory(file: string): string {
    const splited = file.split(sep);
    const fileName = splited.pop();
    const flashCardsDirectoryPath = [...splited, `.${fileName}.flashCards`].join(sep);
    return flashCardsDirectoryPath;
}
