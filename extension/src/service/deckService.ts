import axios from 'axios';
import { findAllImagePaths, findAll, sanitizeLatex } from '../util/mdUtils';
import { basename, sep } from 'path';
import { promises } from 'fs';
import { Uri } from 'vscode';
import * as MarkdownIt from 'markdown-it';
import { FlashCard } from './cardService';
import { FlashCardEntity } from '../entities/FlashCardEntity';

export interface Deck {
    deckName: string;
}

export interface DeckService {
    getAllDecks(): Promise<Deck[]>;
    createCard(card: FlashCardWithDeck, cardPath: Uri): Promise<string>;
    updateCard(card: FlashCardWithDeck, cardPath: Uri): Promise<void>;
}

interface AnkiResponse<T> {
    result: T;
    error: string;
}

export interface FlashCardWithDeck extends FlashCard {
   deck: string;
}

interface AnkiAction<T> {
    action: string;
    version: 6;
    params?: T;
}

interface AllDecsAction extends  AnkiAction<undefined> {
    action: 'deckNames';
}

interface CheckMediaAction extends AnkiAction<{ filename: string }> {
    action: 'retrieveMediaFile';
}

interface StoreMediaAction extends AnkiAction<{ filename: string, data: string }> {
    action: "storeMediaFile";
}

interface AddNote extends AnkiAction<{ 
    note: { 
        deckName: string, 
        modelName: "Basic", 
        fields: { 
            Front: string, 
            Back: string   
        },
        options: {
            allowDuplicate: true
        },
        tags: string[]
    } }> {
        action: "addNote";
}

/*
res = req.post("http://localhost:8765", json = { 'action': 'deckNames', 'version': 6})
*/
export class AnkiDeckService implements DeckService {

    private readonly md = new MarkdownIt();
    private readonly ALL_DECS_ACTION: AllDecsAction =  { 'action': 'deckNames', 'version': 6};
    private retrieveMedia(filename: string): CheckMediaAction {
        return  { 
            action: 'retrieveMediaFile',
            version: 6,
            params: { filename } 
        };
    }

    private storeMediaAction(filename: string, data: string): StoreMediaAction {
        return {
            action: 'storeMediaFile',
            version: 6,
            params: {
                filename,
                data
            }
        };
    }

    constructor(
        private readonly workDir: string,
        private readonly ankiHost: string = "http://localhost:8765",
    ) {}

    async getAllDecks(): Promise<Deck[]> {
        const resp = await axios.post<AnkiResponse<Array<string>>>(this.ankiHost, this.ALL_DECS_ACTION);

        const data = resp.data;
        if (data.error) {
            throw new Error(`Failed to retrieve anki decks check if Anki connect is running at ${this.ankiHost}`);
        }

        return data.result.map(deckName => { return { deckName }; });
    }

    async createCard(card: FlashCardWithDeck, cardPath: Uri): Promise<string> {
        const allDecs = new Set([...(await this.getAllDecks()).map(d => d.deckName )]);
        if (!allDecs.has(card.deck)) {
            throw new Error(`Invalid deck ${card.deck} choose one of ${[...allDecs].join(',')}`);
        }

        const fixedBack = await this.storeImagesAsMedia(card.content, cardPath);
        const html = this.md.render(fixedBack);
        const Back = await sanitizeLatex(html);
        const Front = await sanitizeLatex(this.md.render(card.name));
        const addNote: AddNote = {
            action: "addNote",
            version: 6,
            params: {
                note: {
                    deckName: card.deck,
                    modelName: "Basic",
                    fields: { Front, Back },
                    options: { allowDuplicate: true, },
                    tags: [ "test_tag" ]
                }
            }
        };

        const resp = await axios.post<AnkiResponse<string>>(this.ankiHost, addNote);
        const entity = new FlashCardEntity();
        if (resp.data.result) {
            entity.ankiCardId = resp.data.result;
            entity.pathFromRootDir = cardPath.path;
            entity.deck = card.deck;
        }
        return resp.data.result;
    }

    async updateCard(card: FlashCardWithDeck, cardPath: Uri): Promise<void> {
        throw new Error("Method not implemented.");
    }

    private async storeMedia(filename: string, data: string): Promise<string> {
        const resp = await axios.post<AnkiResponse<string>>(this.ankiHost, this.storeMediaAction(filename, data));
        if (resp.data.error || resp.data.result) {
            throw new Error(`Failed to store image: ${filename}`);
        } else {
            return filename;
        }
    }

    private async storeImagesAsMedia(back: string, cardPath: Uri): Promise<string> {
        for (const image of findAllImagePaths(back)) {
            const base = basename(image);

            let imagePath: string;
            if (image.startsWith("..")) {
                const splited = cardPath.fsPath.split(sep);
                splited.pop();
                splited.pop();
                imagePath = [...splited, image.substr(image.indexOf(sep) + 1)].join(sep);
            } else {
                imagePath = image;
            }

            const res = await axios.post<AnkiResponse<string>>(this.ankiHost, this.retrieveMedia(base));
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