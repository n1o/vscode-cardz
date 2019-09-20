import MarkdownIt = require("markdown-it");
import { load } from "cheerio";
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


    public createFlashCard(content: string): FlashCard {
        const md = new MarkdownIt();
        const html = md.render(content);
        const $ = load(html);
        const header = this.findHeader($);
    
        if (!header) {
            throw new Error("Failed to find header");
        }
    
        for (const imagePath of findAllImagePaths(content)) {
            // Check if it not an absolute path!
            if(!imagePath.startsWith(sep) && !imagePath.startsWith("..")) {
                content = content.replace(imagePath, `../${imagePath}`);
            }
        }
    
        return {
            name: header,
            content: content.replace(header, ''),
        };
    }

    async flushCard(card: FlashCard, deck: string, flashCardPath: string): Promise<void> {
        const f = await promises.open(flashCardPath, "w");
        await f.write(render(NEW_CARD_MD, { deck, front: card.name, content: card.content }));
        return f.close();

    }
    static cardName(card: FlashCard): string {
        return `${card.name.replace(/[\W_]+/g, "_")}.md`;
    }
    private findHeader(data: CheerioStatic, fromLevel: number = 1): string | undefined {
        const text = data(`h${fromLevel}`).first().text();
        if (text) {
            return `${"#".repeat(fromLevel)} ${text}`;
        } else if (fromLevel < 5) {
            return this.findHeader(data, fromLevel + 1);
        } else {
            return undefined;
        }
    }
}

export interface FlashCard {
    name: string;
    content: string;
}

