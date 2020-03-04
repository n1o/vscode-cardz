import { findAllImagePaths } from "../util/mdUtils";
import { sep } from "path";
import { promises } from 'fs';
import { renderString } from "nunjucks";

const NEW_CARD_MD = 
`---
Deck: {{deck}}
Front: {{front}}
Back:
---
{{back}}`;
export class CardService {

    private static readonly FRONT_REG = /Front: (.*)/g;
    private static readonly DECK_REG = /Deck: (.*)/g;

    public cardName(content: string): string | undefined {
        return content.split("\n").shift();
    }

    public createFlashCard(back: string, front: string, deck: string): FlashCard {

        for (const imagePath of findAllImagePaths(back)) {
            // Check if it not an absolute path!
            if(!imagePath.startsWith(sep) && !imagePath.startsWith("..")) {
                back = back.replace(imagePath, `../${imagePath}`);
            }

            if(imagePath.startsWith(`.${sep}`)) {
                back = back.replace(imagePath, `.${imagePath}`);
            }
        }
    
        return { front, back, deck };
    }

    async flushCard(card: FlashCard, flashCardPath: string): Promise<void> {
        const { front, back, deck } = card;
        const f = await promises.open(flashCardPath, "w");
        await f.write(renderString(NEW_CARD_MD, { deck, front, back }));
        return f.close();

    }
    static fsCardName(card: FlashCard): string {
        return `${card.front.replace(/[\W_]+/g, "_")}.md`;
    }

    static front(s: string): string {
        return s.match(this.FRONT_REG)![0].replace('Front: ', '');
    }
    static back(s: string): string {
        return s.slice(s.lastIndexOf("---") + 4);
    }
    
    static deck(s: string): string {
        return s.match(this.DECK_REG)![0].replace('Deck: ', '');
    }

    static async getFrontDeck(cardPath: string): Promise<{front: string, deck: string}> {
       const card = await promises.readFile(cardPath);
       const content = card.toString();

       return {
           front: this.front(content),
           deck: this.deck(content)
       };
    }
}

export interface FlashCard {
    front: string;
    back: string;
    deck: string;
}