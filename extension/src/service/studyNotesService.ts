import { DeckService } from "./deckService";

class NotesService {
    private static readonly FRONT_REG = /Front: (.*)/g;
    
    constructor(
        private readonly decsService: DeckService
    ){}

    updateNote(id: string, deck: string, text: string, cardPath: string) {

        const front = NotesService.front(text);
        const back = NotesService.back(text);


        const card = { deck, front, back, id };
        this.decsService.updateCard(card, cardPath);

    }

    static front(s: string): string {
        return s.match(this.FRONT_REG)![0].replace('Front: ', '');
    }
    static back(s: string): string {
        return s.slice(s.lastIndexOf("---") + 4);
    }
}

export default NotesService;