import { window, commands, Uri, TextDocument, TextEditor, DecorationOptions, Range } from "vscode";
import { DeckService } from "../service/deckService";
import decksQuickPick from "../selection/decsPicker";
import { CardInstance, CardsService } from "../service/CardInstance";
import { readdirSync } from "fs";
import { sep } from "path";
import { readFileSync } from "fs";
import { coverage } from "../util/flashCardCoverage";

const cardDecoration = window.createTextEditorDecorationType(
    { 
        cursor: 'crosshair',
        backgroundColor: {
            id: 'studyNotes.cardCoverage'
        }
    }
);

export class CardsController {
    constructor(
        private readonly decsService: DeckService,
        private readonly cardsService: CardsService,
        private readonly rootFolder: string,
        private readonly cardsPath: string
    ){}

    public async coverage(editor: TextEditor) {
        const document = editor.document;
        const uri = document.uri.fsPath;
        const text = document.getText();
        const cardPath = [this.cardsPath, uri.replace(this.rootFolder, "")].join("");

        const children = readdirSync(cardPath);
        const cards: Map<string, string> = new Map();

        for (const child of children) {
            const documentPath = [cardPath, child].join(sep);
            const content = readFileSync(documentPath);
            const card = CardInstance.fromMarkdown(content.toString(), documentPath);
            
            cards.set(card.front, card.back);
        }

        const cardCoverage = coverage(text, cards);

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

    public async updateNote(doc: TextDocument) {
        const documentPath = doc.uri.fsPath;
        const text = doc.getText();

        if(text) {
            try {
                window.showInformationMessage("Updating card");
                const card = CardInstance.fromMarkdown(text, documentPath);
                await this.decsService.updateCard(card);
                window.showInformationMessage("Done");
            } catch (e) {
                window.showErrorMessage(e.message);
            }
        }
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
            window.showInformationMessage("Creating...");
            const file = editor.document.uri;
            const card = this.cardsService.fixImgePath(CardInstance.newCard(cardName, text, deck, file.fsPath))
            const { id } = await this.decsService.newCard(card);
            card.id = id;
            const { cardPath } = this.cardsService.flushCard(card);
            commands.executeCommand("vscode.open", Uri.file(cardPath));
        });
        quickPic.show();
    }
}