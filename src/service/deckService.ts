import axios from 'axios';
import { findAllImagePaths, sanitizeLatex } from '../util/mdUtils';
import { basename, sep } from 'path';
import { promises } from 'fs';
import * as MarkdownIt from 'markdown-it';
import { FlashCard } from './cardService';

export interface Deck {
    deckName: string;
}

export interface DeckService {
    getAllDecks(): Promise<Deck[]>;
    createCard(card: FlashCard, cardPath: string): Promise<string>;
    updateCard(card: FlashCard, cardPath: string): Promise<void>;
    serviceName(): string;
}

interface AnkiResponse<T> {
    result: T;
    error: string;
}

export interface FlashCardWithDeckAndId extends FlashCard {
    id: string;
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

export class AnkiDeckService implements DeckService {

    private readonly md = new MarkdownIt();
    private readonly ALL_DECS_ACTION: AllDecsAction =  new AllDecsAction();

    constructor(
        private readonly ankiHost: string = "http://localhost:8765",
    ) {}

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

    async validateDeck(card: FlashCard): Promise<void> { 
        const allDecs = new Set([...(await this.getAllDecks()).map(d => d.deckName )]);
        if (!allDecs.has(card.deck)) {
            throw new Error(`Invalid deck ${card.deck} choose one of ${[...allDecs].join(',')}`);
        }
    }

    async updateCard(card: FlashCardWithDeckAndId, cardPath: string): Promise<void> {
        const { back: content, front: name, id } = card;

        const fixedBack = await this.storeImagesAsMedia(content, cardPath);
        const html = this.md.render(fixedBack);
        const Back = await sanitizeLatex(html);
        const Front = await sanitizeLatex(this.md.render(name));
        const updateNote = new UpdateNote(id, Front, Back);

        const resp = await axios.post<AnkiResponse<UpdateNote>>(this.ankiHost, updateNote.stringify());
        if (!resp.data.result) {
            throw new Error(resp.data.error);
        }
    }

    async createCard(card: FlashCard, cardPath: string): Promise<string> {
        const fixedBack = await this.storeImagesAsMedia(card.back, cardPath);
        const html = this.md.render(fixedBack);
        const Back = await sanitizeLatex(html);
        const Front = await sanitizeLatex(this.md.render(card.front));
        const addNote = new AddNote(card.deck, Front, Back, []);

        const resp = await axios.post<AnkiResponse<string>>(this.ankiHost, addNote.stringify());
        if (!resp.data.result) {
            throw new Error(resp.data.error);
        }
        return resp.data.result;
    }

    private async storeMedia(filename: string, data: string): Promise<string> {
        const action = new StoreMediaAction(filename, data);
        const resp = await axios.post<AnkiResponse<string>>(this.ankiHost, action.stringify());

        if (resp.data.error || resp.data.result) {
            throw new Error(`Failed to store image: ${filename}`);
        } else {
            return filename;
        }
    }

    private async storeImagesAsMedia(back: string, cardPath: string): Promise<string> {
        for (const image of findAllImagePaths(back)) {
            const base = basename(image);

            let imagePath: string;
            if (image.startsWith("..")) {
                const splited = cardPath.split(sep);
                splited.pop();
                splited.pop();
                imagePath = [...splited, image.substr(image.indexOf(sep) + 1)].join(sep);
            } else {
                imagePath = image;
            }

            const action = new CheckMediaAction(base);
            const res = await axios.post<AnkiResponse<string>>(this.ankiHost, action.stringify());
            const {result, error } = res.data;

            if(result) {
                console.log(`File already stored ${imagePath}`);
                back = back.replace(new RegExp(image, "g"), base);
            } else {
                const data = await promises.open(imagePath, "r");
                const content = await data.readFile();
                await this.storeMedia(base, content.toString('base64'));
                console.log(`Newly uploaded file ${imagePath}`);
                back = back.replace(new RegExp(image, "g"), base);
            }
        }
        return back;
    }
}
