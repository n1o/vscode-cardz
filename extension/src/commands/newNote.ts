import * as vscode from 'vscode';
import { sep } from 'path';
import { promises } from 'fs';
import { DeckService } from '../service/deckService';
import decksQuickPick from '../selection/decsPicker';
import { CardService } from '../service/cardService';
import { flashCardsDirectory } from '../util/walk';

export default async function newNote(
        context: vscode.ExtensionContext,
        decsService: DeckService,
        cardService: CardService
    ) {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
        const selection = editor.selection;
        const text = editor.document.getText(selection);
        const cardName = await vscode.window.showInputBox({
            value: cardService.cardName(text) || "Pick Card Front"
        });

        if (!cardName || cardName === "Pick Card Front") {
            throw new Error(`Invalid card name ${cardName}`);
        }

        const card = cardService.createFlashCard(text, cardName);
        const flashCardName = CardService.cardName(card);

        const file = editor.document.uri;

        const flashCardsDirectoryPath = flashCardsDirectory(file.path); 
        try {
            await promises.mkdir(flashCardsDirectoryPath);
        } catch (err) {}

        const quickPic = await decksQuickPick(decsService, async (deck) => {
            const flashCardPath = [flashCardsDirectoryPath, flashCardName].join(sep);
            const flashCardUri = vscode.Uri.file(flashCardPath);

            const id = await decsService.createCard({ deck, ...card }, flashCardUri.path);

            context.workspaceState.update(flashCardUri.path, id);

            await cardService.flushCard(card, deck, flashCardPath );
            
            vscode.commands.executeCommand('vscode.open', flashCardUri);
        });
        quickPic.show();

    } else {
        vscode.window.showErrorMessage("Select the text you want to make a flashcard from");
    }
}


