import { promises } from 'fs';
import { join, basename, dirname } from 'path';

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
    const fileName = basename(file);
    const dir = dirname(file);
    const ext = `.${fileName}.flashCards`;
    const flashCardsDirectoryPath = join(dir, ext);
    return flashCardsDirectoryPath;
}
