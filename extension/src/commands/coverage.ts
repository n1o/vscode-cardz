import { Uri, ExtensionContext, window } from "vscode";
import { promises } from 'fs';
import { flashCardsDirectory, walkDirectory } from "../util/walk";
import { join } from "path";
import NotesService from "./updateNote";
import { coverage } from "../util/flashCardCoverage";

export async function coverageAction(context: ExtensionContext, note: Uri) {

    const flasCardPath = flashCardsDirectory(note.path);
    if (!(await promises.stat(flasCardPath)).isDirectory()) {
        window.showInformationMessage("No flash cards found");   
    }

    const main = (await promises.readFile(note.path)).toString();

    const cards = await promises.readdir(flasCardPath);
    const openFiles = await Promise.all(cards.map(card => promises.readFile(join(flasCardPath, card), "r")));
    const frontBack = new Map(
        openFiles.map(buffer => {
            const cardContent = buffer.toString();
            const front = NotesService.front(cardContent);
            const back = NotesService.back(cardContent);
            return [front, back];
        })
    );

    const cardCoverage = coverage(main, frontBack);

}