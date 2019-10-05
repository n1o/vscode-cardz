import * as vscode from 'vscode';
import { sep } from 'path';
import { promises } from 'fs';
import { DeckService } from '../service/deckService';
import decksQuickPick from '../selection/decsPicker';
import { CardService } from '../service/cardService';

export default async function newNote(
        context: vscode.ExtensionContext,
        decsService: DeckService,
        cardService: CardService
    ) {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
        const selection = editor.selection;
        const text = editor.document.getText(selection);

        const card = cardService.createFlashCard(text);
        const flashCardName = CardService.cardName(card);

        const file = editor.document.uri;
        const splited = file.path.split(sep);
        const fileName = splited.pop();
        const flashCardsDirectoryPath = [...splited, `.${fileName}.flashCards`].join(sep); 
        try {
            await promises.mkdir(flashCardsDirectoryPath);
        } catch (err) {}

        const quickPic = await decksQuickPick(decsService, async (deck) => {
            const flashCardPath = [flashCardsDirectoryPath, flashCardName].join(sep);
            const flashCardUri = vscode.Uri.file(flashCardPath);

            const id = await decsService.createCard({ deck, ...card }, flashCardUri);

            context.workspaceState.update(flashCardUri.path, id);

            await cardService.flushCard(card, deck, flashCardPath );
            
            vscode.commands.executeCommand('vscode.open', flashCardUri);
        });
        quickPic.show();

    } else {
        vscode.window.showErrorMessage("Select the text you want to make a flashcard from");
    }
}


