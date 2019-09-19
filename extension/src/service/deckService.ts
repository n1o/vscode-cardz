import axios from 'axios';
import { findAllImagePaths } from '../util/mdUtils';
import { basename, sep } from 'path';
import { fstat, promises } from 'fs';
import { Uri } from 'vscode';

export interface Deck {
    deckName: string;
}


export interface DeckService {
    getAllDecks(): Promise<Deck[]>;
    storeCard(card: FlashCard, cardPath: Uri): Promise<void>;
}

interface AnkiResponse<T> {
    result: T;
    error: string;
}

export interface FlashCard {
    front: string;
    back: string;
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
/*
res = req.post("http://localhost:8765", json = { 'action': 'deckNames', 'version': 6})
*/
export class AnkiDeckService implements DeckService {

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
        private readonly ankiHost: string = "http://localhost:8765"
    ) {}

    async getAllDecks(): Promise<Deck[]> {
        const resp = await axios.post<AnkiResponse<Array<string>>>(this.ankiHost, this.ALL_DECS_ACTION);

        const data = resp.data;
        if (data.error) {
            throw new Error(`Failed to retrieve anki desck check if Anki connect is running at ${this.ankiHost}`);
        }

        return data.result.map(deckName => { return { deckName }; });
    }

    async storeCard(card: FlashCard, cardPath: Uri): Promise<void> {
        const allDecs = new Set([...(await this.getAllDecks()).map(d => d.deckName )]);
        if (!allDecs.has(card.deck)) {
            throw new Error(`Invalid deck ${card.deck} choose one of ${[...allDecs].join(',')}`);
        }

        const fixedBack = this.storeImagesAsMedia(card.back, cardPath);
        console.log(fixedBack);
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
        const backClone = Object.assign("", back);
        for (const image of findAllImagePaths(back)) {
            const base = basename(image);

            const res = await axios.post<AnkiResponse<string>>(this.ankiHost, this.retrieveMedia(base));
            const {result, error } = res.data;

            if(result) {
               console.log(`File already stored ${image}`);
               back.replace(new RegExp(image, "g"), base);
            }

            let imagePath: string;
            if (image.startsWith("..")) {
                const splited = cardPath.fsPath.split(sep);
                splited.pop();
                splited.pop();
                imagePath = [...splited, image.substr(image.indexOf(sep) + 1)].join(sep);
            } else {
                imagePath = image;
            }
            
            const data = await promises.open(imagePath, "r");
            const content = await data.readFile();
            await this.storeMedia(base, content.toString('base64'));
            console.log(`Newly uploaded file ${image}`);
            back.replace(new RegExp(image, "g"), base);
        }
        return back;
    }
}