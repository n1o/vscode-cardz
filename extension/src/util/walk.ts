import { promises } from 'fs';
import * as path from 'path';

export async function walkDirectory(rootPath: string): Promise<string[]> {
 
    const stat = await promises.stat(rootPath);

    if (stat.isDirectory()) {
        const children = await promises.readdir(rootPath);
        const res = await Promise.all(children.map(child => walkDirectory(path.join(rootPath, child))));
        
        const reduced = res.reduce((pre, cur) => [...pre, ...cur]);
        return reduced;
    } else {
        return [rootPath];
    }
}

export async function fileAsString(path: string): Promise<string> {
    const f = await promises.readFile(path, 'utf8');
    return f.toString();
}