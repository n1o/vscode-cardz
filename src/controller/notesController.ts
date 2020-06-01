import { window, commands, Uri, TextDocument } from "vscode";
import { DeckService } from "../service/deckService";
import decksQuickPick from "../selection/decsPicker";
import { CardInstance, CardsService } from "../entity/CardInstance";


export class CardsController {
    constructor(
        private readonly decsService: DeckService,
        private readonly cardsService: CardsService
    ){}


    public async updateNote(doc: TextDocument) {

    }

    public async newNote() {
        const editor = window.activeTextEditor;

        if(!editor) {
            window.showErrorMessage("Select document from which create a card");
            return;
        }

        const text = editor.document.getText(editor.selection);

        const cardName = await window.showInputBox({
            value: "Pick Front"
        });

        if(!cardName) {
            window.showErrorMessage("Need to pick an card name");
            return;
        }

        const quickPic = await decksQuickPick(this.decsService, async (deck) => {
            const file = editor.document.uri;
            const card = CardInstance.newCard(cardName, text, deck, file.fsPath)
            const { id } = await this.decsService.newCard(card);
            card.id = id;
            const { cardPath } = this.cardsService.flushCard(card);
            commands.executeCommand("vscode.open", Uri.file(cardPath));
        });
        quickPic.show();
    }
}