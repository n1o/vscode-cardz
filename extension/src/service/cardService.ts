import { findAllImagePaths } from "../util/mdUtils";
import { sep } from "path";
import { promises } from 'fs';
import { render } from "mustache";

const NEW_CARD_MD = 
`---
Deck: {{deck}}
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
            name,
            content
        };
    }

    async flushCard(card: FlashCard, deck: string, flashCardPath: string): Promise<void> {
        const f = await promises.open(flashCardPath, "w");
        await f.write(render(NEW_CARD_MD, { deck, front: card.name, content: card.content }));
        return f.close();

    }
    static fsCardName(card: FlashCard): string {
        return `${card.name.replace(/[\W_]+/g, "_")}.md`;
    }
}

export interface FlashCard {
    name: string;
    content: string;
}

