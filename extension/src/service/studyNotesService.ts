import { DeckService } from "./deckService";
import { CardService } from "./cardService";

class NotesService {
    
    constructor(
        private readonly decsService: DeckService
    ){}

    updateNote(id: string, text: string, cardPath: string) {

        const front = CardService.front(text);
        const back = CardService.back(text);
        const deck = CardService.deck(text);

        const card = { deck, front, back, id };
        this.decsService.updateCard(card, cardPath);
    }
}

export default NotesService;