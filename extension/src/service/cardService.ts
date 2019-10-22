import { findAllImagePaths } from "../util/mdUtils";
import { sep } from "path";
import { promises } from 'fs';
import { render } from "mustache";

const NEW_CARD_MD = 
`---
Front: {{{front}}}
Back:
---
{{{content}}}`;
export class CardService {

    public cardName(content: string): string | undefined {
        return content.split("\n").shift();
    }

    public createFlashCard(content: string, name: string): FlashCard {

        for (const imagePath of findAllImagePaths(content)) {
            // Check if it not an absolute path!
            if(!imagePath.startsWith(sep) && !imagePath.startsWith("..")) {
                content = content.replace(imagePath, `../${imagePath}`);
            }
        }
    
        return {
            front: name,
            back: content
        };
    }

    async flushCard(card: FlashCard, deck: string, flashCardPath: string): Promise<void> {
        const f = await promises.open(flashCardPath, "w");
        await f.write(render(NEW_CARD_MD, { deck, front: card.front, content: card.back }));
        return f.close();

    }
    static fsCardName(card: FlashCard): string {
        return `${card.front.replace(/[\W_]+/g, "_")}.md`;
    }
}

export interface FlashCard {
    front: string;
    back: string;
}

