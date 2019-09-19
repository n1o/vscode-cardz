import axios from 'axios';
import { findAllImagePaths } from '../util/mdUtils';
import { basename } from 'path';

export interface Deck {
    deckName: string;
}


export interface DeckService {

    getAllDecks(): Promise<Deck[]>;

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

/*
res = req.post("http://localhost:8765", json = { 'action': 'deckNames', 'version': 6})
*/
export class AnkiDeckService implements DeckService {

    private readonly ALL_DECS_ACTION =  { 'action': 'deckNames', 'version': 6};
    private retrieveMedia(fileName: string) {
        return  { 
            'action': 'retrieveMediaFile',
             'version': 6,
              "params": { "filename": fileName} 
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

    async storeCard(card: FlashCard): Promise<void> {
        const allDecs = new Set([...(await this.getAllDecks()).map(d => d.deckName )]);
        if (!allDecs.has(card.deck)) {
            throw new Error(`Invalid deck ${card.deck} choose one of ${[...allDecs].join(',')}`)
        }
    }

    private async storeImagesAsMedia(back: string): string {
        for (const image of findAllImagePaths(back)) {
            const base = basename(image);

            const res = await axios.post<AnkiResponse<string>>(this.ankiHost, this.retrieveMedia(base));
            const {result, error } = res.data;
            if(result === "false") {
                
            }

        }

        
        return "";
        
    }
}