import { DeckService } from "../service/deckService";
import * as vscode from 'vscode';

export default async function decksQuickPick(decsService: DeckService, f: (selectedDeck: string) => Promise<void>): Promise<vscode.QuickPick<vscode.QuickPickItem>> {

    const allDecs = await decsService.getAllDecks();
    const quickPick = vscode.window.createQuickPick();
    quickPick.items = allDecs.map( deck =>  { return { label: deck.deckName };});

    quickPick.canSelectMany = false;
    quickPick.title = "Select A Deck";

    quickPick.onDidChangeSelection(async selection => {
        const deck = selection[0].label;
        quickPick.value = deck;
        quickPick.dispose();
        vscode.window.showInformationMessage("Creating card");
        await f(deck);
    });

    quickPick.onDidHide(() => quickPick.dispose());
    return quickPick;
}