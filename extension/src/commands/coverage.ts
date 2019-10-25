import { ExtensionContext, window, Range, DecorationOptions } from "vscode";
import { promises } from 'fs';
import { flashCardsDirectory } from "../util/walk";
import { join } from "path";
import { coverage } from "../util/flashCardCoverage";
import { CardService } from "../service/cardService";

const cardDecoration = window.createTextEditorDecorationType(
    { 
        cursor: 'crosshair',
        backgroundColor: {
            id: 'studyNotes.cardCoverage'
        }
    }
);

export async function coverageAction(context: ExtensionContext) {
    const editor = window.activeTextEditor;
    if (!editor) {
        window.showErrorMessage("Select an flash card first");
    }
    const document = editor!.document;
    const note = document.uri;

    const flasCardPath = flashCardsDirectory(note.path);
    if (!(await promises.stat(flasCardPath)).isDirectory()) {
        window.showInformationMessage("No flash cards found");   
    }

    const main = (await promises.readFile(note.path)).toString();

    const cards = await promises.readdir(flasCardPath);
    const openFiles = await Promise.all(cards.map(card => promises.readFile(join(flasCardPath, card))));
    const frontBack = new Map(
        openFiles.map(buffer => {
            const cardContent = buffer.toString();
            const front = CardService.front(cardContent);
            const back = CardService.back(cardContent);
            return [front, back];
        })
    );

    const cardCoverage = coverage(main, frontBack);
    const ranges: DecorationOptions[] = [];

    for (const [cardFront, solutions] of cardCoverage.entries()) {
        if (solutions.length === 0) {
            continue;
        }
        const { startPosition } = solutions[0];
        const { endPosition } = solutions[solutions.length - 1];
        
        const decoration: DecorationOptions = { 
            range: new Range(
                document.positionAt(startPosition), 
                document.positionAt(endPosition)
                ),
            hoverMessage: cardFront
            };
        ranges.push(decoration);
    }

    editor!.setDecorations(cardDecoration, ranges);
}