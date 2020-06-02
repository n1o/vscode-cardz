import axios from 'axios';
import * as MarkdownIt from 'markdown-it';
// import { FlashCard } from './cardService';
import { CardInstance } from './CardInstance';
import { readFileSync } from 'fs';
import { sanitizeLatex } from '../util/mdUtils';

export interface Deck {
    deckName: string;
}

export interface DeckService {
    getAllDecks(): Promise<Deck[]>;
    newCard(card: CardInstance): Promise<{ id: string }>;
    updateCard(card: CardInstance): Promise<void>;
    serviceName(): string;
}

export class AnkiDeckService implements DeckService {

    private readonly md = new MarkdownIt();
    private readonly ALL_DECS_ACTION: AllDecsAction =  new AllDecsAction();

    constructor(
        private readonly ankiHost: string = "http://localhost:8765",
    ) {}
    
    async updateCard(card: CardInstance): Promise<void> {
        let _back = card.back;
        for (const { absolutePath, src } of card.images) {
            const content = readFileSync(absolutePath);
            const base64CardName = `${Buffer.from(absolutePath).toString("base64")}.png`
            await this.storeMedia(base64CardName, content.toString("base64"));
            _back = _back.replace(src, base64CardName);
        }

        const back = sanitizeLatex(this.md.render(_back));
        const front = sanitizeLatex(this.md.render(card.front));

        const updateNote = new UpdateNote(card.id, front, back);
        const resp = await axios.post<AnkiResponse<UpdateNote>>(this.ankiHost, updateNote.stringify());
        if (resp.data.error) {
            throw new Error(resp.data.error);
        }
    }

    async newCard(card: CardInstance): Promise<{ id: string }> {
        let _back = card.back;
        for (const { absolutePath, src } of card.images) {
            const content = readFileSync(absolutePath);
            const base64CardName = `${Buffer.from(absolutePath).toString("base64")}.png`
            await this.storeMedia(base64CardName, content.toString("base64"));
            _back = _back.replace(src, base64CardName);
        }
        
        const back = sanitizeLatex(this.md.render(_back));
        const front = sanitizeLatex(this.md.render(card.front));
        const addNote = new AddNote(card.deck, front, back, []);
        const resp = await axios.post<AnkiResponse<string>>(this.ankiHost, addNote.stringify());
        if (!resp.data.result) {
            throw new Error(resp.data.error);
        }

        return { id: resp.data.result };
    }

    serviceName() {
        return 'Anki';
    }

    async getAllDecks(): Promise<Deck[]> {
        const resp = await axios.post<AnkiResponse<Array<string>>>(this.ankiHost, this.ALL_DECS_ACTION.stringify());

        const data = resp.data;
        if (data.error) {
            throw new Error(`Failed to retrieve anki decks check if Anki connect is running at ${this.ankiHost}`);
        }

        return data.result.map(deckName => { return { deckName }; });
    }

    private async storeMedia(filename: string, data: string): Promise<string> {
        const action = new StoreMediaAction(filename, data);
        const resp = await axios.post<AnkiResponse<string>>(this.ankiHost, action.stringify());
        console.log("RESPONSE", resp);
        if (resp.data.error || resp.data.result) {
            throw new Error(`Failed to store image: ${filename}`);
        } else {
            return filename;
        }
    }
}


interface AnkiResponse<T> {
    result: T;
    error: string;
}

class AnkiAction<T> {
    public readonly version: number = 6;
    constructor(
        public readonly action: string,
        public readonly params: T
        ) { }
    stringify(): string { return JSON.stringify(this) };
}
class AllDecsAction extends  AnkiAction<undefined> {
    constructor(){
        super("deckNames", undefined);
    }
}

class CheckMediaAction extends AnkiAction<{ filename: string }> {
    constructor(filename: string) {
        super("retrieveMediaFile", { filename });
    }
}

class StoreMediaAction extends AnkiAction<{ filename: string, data: string }> {
    constructor(filename: string, data: string) {
        super("storeMediaFile", { filename, data });
    }
}

interface Fields {
    Front: string; 
    Back: string; 
}

class AddNote extends AnkiAction<{ 
    note: { 
        deckName: string, 
        modelName: "Basic", 
        fields: Fields,
        options: {
            allowDuplicate: true
        },
        tags: string[] }
    }> {
        constructor(deckName: string,  Front: string, Back: string, tags: string[]) {
            super("addNote", { note: { deckName, modelName: "Basic",  fields: { Front, Back },  options: { allowDuplicate: true }, tags  } });
        }
    }

class UpdateNote extends AnkiAction<{
    note: {
        id: string;
        fields: Fields
    }
}> {
    constructor(id: string, Front: string, Back : string) {
        super("updateNoteFields", { note: { id, fields: { Front, Back } }});
    }
}