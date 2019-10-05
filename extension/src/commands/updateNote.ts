import * as vscode from 'vscode';

import { CardService } from "../service/cardService";
import { DeckService } from "../service/deckService";

class NotesService {
    private readonly DECK_REG = /Deck: (.*)/g;
    private readonly FRONT_REG = /Front: (.*)/g;
    
    constructor(
        private context: vscode.ExtensionContext,
        private readonly decsService: DeckService,
        private readonly cardService: CardService
    ){}

    updateNote(id: string, text: string, cardPath: vscode.Uri) {

        const deck = this.DECK_REG.exec(text)![1];
        const front = this.FRONT_REG.exec(text)![1];
        const back = text.slice(text.lastIndexOf("---") + 4);


        const card = { deck, name: front, content: back, id };
        this.decsService.updateCard(card, cardPath);

    }
}

export default NotesService;