import * as vscode from 'vscode';

import { CardService } from "../service/cardService";
import { DeckService } from "../service/deckService";

class NotesService {
    private static readonly DECK_REG = /Deck: (.*)/g;
    private static readonly FRONT_REG = /Front: (.*)/g;
    
    constructor(
        private context: vscode.ExtensionContext,
        private readonly decsService: DeckService,
        private readonly cardService: CardService
    ){}

    updateNote(id: string, text: string, cardPath: vscode.Uri) {

        const deck = NotesService.deck(text);
        const front = NotesService.front(text);
        const back = NotesService.back(text);


        const card = { deck, name: front, content: back, id };
        this.decsService.updateCard(card, cardPath);

    }

    static deck(s: string): string {
        return s.match(this.DECK_REG)![0].replace('Deck: ', '');
    }

    static front(s: string): string {
        return s.match(this.FRONT_REG)![0].replace('Front: ', '');
    }
    static back(s: string): string {
        return s.slice(s.lastIndexOf("---") + 4);
    }
}

export default NotesService;