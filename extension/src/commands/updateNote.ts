import { CardService } from "../service/cardService";
import { DeckService } from "../service/deckService";

class NotesService {
    private readonly DECK_REG = /Deck: (.*)/g;
    private readonly FRONT_REG = /Front: (.*)/g;
    private readonly ID_REG = /ID: (.*)/g;
    
    constructor(
        public readonly decsService: DeckService,
        public readonly cardService: CardService
    ){}

    updateNote(text: string) {

        const deck = this.DECK_REG.exec(text)![1];
        const front = this.FRONT_REG.exec(text)![1];
        const id = this.ID_REG.exec(text)![1];
        const back = text.slice(text.lastIndexOf("---") + 4);
    }
}

export default NotesService;