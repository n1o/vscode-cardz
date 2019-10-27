import { promises } from 'fs';
import { join, basename, dirname } from 'path';

export async function walkDirectory(rootPath: string): Promise<string[]> {
    try {
        const stat = await promises.stat(rootPath);
        if (stat.isDirectory()) {
            const children = await promises.readdir(rootPath);
            const childrenPath = await Promise.all(children.map(child => walkDirectory(join(rootPath, child))));
            
            const reduced = childrenPath.reduce((pre, cur) => [...pre, ...cur]);
            return reduced;
        } else {
            return [rootPath];
        }
    } catch (e){
        console.error(`Failed to walk directory ${rootPath}`);
    }
    return [];
}

export function flashCardsDirectory(file: string): string {
    const fileName = basename(file);
    const dir = dirname(file);
    const ext = `.${fileName}.flashCards`;
    const flashCardsDirectoryPath = join(dir, ext);
    return flashCardsDirectoryPath;
}

export async function getFlashCards(cardPath: string): Promise<string[]> {
    try {
        const cardsDir = flashCardsDirectory(cardPath);
        const cards = await promises.readdir(cardsDir);
        return cards.map(card => join(cardsDir, card));
    } catch (e) {
        return [];
    }
}
