import { renderString } from "nunjucks";
import { resolveLink } from "../util/resolveLink";
import { mkdirSync } from "fs";
import { sep } from "path";
import { writeFileSync } from "fs";

const NEW_CARD_MD = 
`---
ID: {{id}}
Front: {{front}}
Deck: {{deck}}
Tags: {{tags}}
Back:
---
{{back}}`;


type CardImage = {
    src: string;
    absolutePath: string;
}

export class CardsService {
    constructor(
        private readonly rootFolder: string, 
        private readonly cardsFolder: string) {
    }

    flushCard(_card: CardInstance): { cardPath: string } {
        const card = this.fixImgePath(_card);
        const cardDirecotry = this.cardDirectory(card);
        mkdirSync(cardDirecotry, { recursive: true });
        const cardPath = [cardDirecotry, card.cardName].join(sep);
        writeFileSync(cardPath, renderString(NEW_CARD_MD, {
            deck: card.deck,
            front: card.front,
            back: card.back,
            id: card.id,
            tags: card.tags
        }));

        return { cardPath };
    };

    public fixImgePath(card: CardInstance): CardInstance {
        const direcotry = this.cardDirectory(card);
        if(card.images.length === 0) {
            return card;
        }

        let back = card.back;

        const newImages: CardImage[] = [];

        for (const { absolutePath, src } of card.images) {
            const parts = direcotry.split(sep);
            for(let i = parts.length - 1; i > 0; i--) {
                const part = parts.slice(0, i).join(sep);
                if(part === this.rootFolder) {
                    const partialRelative = absolutePath.replace(this.rootFolder + sep, "");
                    const upToRoot = [...Array(i - 2)].map(_ => "..").join(sep);
                    const newRelative = [upToRoot, partialRelative].join(sep);
                    back = back.replace(src, newRelative);
                    newImages.push({ src: newRelative, absolutePath });
                }
            }
        }
        card.images = newImages;
        card.back = back;
        return card;
    }

    public cardDirectory(card: CardInstance): string {
        let i = 0;
        const rootDir = this.rootFolder.split(sep);
        const cardDir = card.documentPath.split(sep);

        while(true) {
            const rootHead = rootDir.shift();
            const docHead = cardDir.shift();
            if(rootHead !== docHead) {
                return [this.rootFolder, this.cardsFolder, docHead, ...cardDir].join(sep);
            }
            i++;
            if(i > 1000) {
                throw new Error(`${card.documentPath} could not be found in root project`);
            }
        }
        
    }
}

export class CardInstance {

    private constructor(
        private _id: string,
        public readonly front: string,
        private _back: string,
        public readonly deck: string,
        public readonly tags: string[],
        private  _images: CardImage[],
        public readonly documentPath: string
        ){}


    get id() {
        return this._id;
    }

    set id(id: string) {
        this._id = id;
    };

    get back() {
        return this._back;
    }

    set back(back: string) {
        this._back = back;
    }

    get images() {
        return this._images;
    }

    set images(images: CardImage[]) {
        this._images = images;
    }

    private static get BACK_REGEX() {
        return /Back:\n---\n((\n|.*)*)/g;
    }

    private static extractBack(text: string) {
        return this.getMatch(text, this.BACK_REGEX, "Failed to find Back:");
    }

    public static fromMarkdown(text: string, documentPath: string): CardInstance {

        const FRONT_REG = /Front: (.*)\n/g;
        const DECK_REG = /Deck: (.*)\n/g;
        const ID_REGEX = /ID: (.*)\n/g;
        const TAGS_REGEX = /Tags: (.*)\n/g;

        const front = this.getMatch(text, FRONT_REG, "Failed to find Front:");
        const deck = this.getMatch(text, DECK_REG, "Failed to find Deck:");
        const id = this.getMatch(text, ID_REGEX, "Failed to find ID:");
        const tags = this.getMatch(text, TAGS_REGEX, "Failed to find Tags:");
        const back = this.getMatch(text, this.BACK_REGEX, "Failed to find Back:");
        const images = this.resolveImages(text, documentPath);

        return new CardInstance(
            id,front, back, deck, (tags || "").split(","), images, documentPath
        )
    }

    public static newCard(front: string, back: string, deck: string, documentPath: string) {
        const images = this.resolveImages(back, documentPath);

        return new CardInstance("", front, back, deck, [], images, documentPath);
    }

    get cardName() {
        return `${this.front.replace(/[\W_]+/g, "_")}.md`;
    }

    private static getMatch(text: string, reg: RegExp, error: string): string {
        const match = reg.exec(text);
        if(!match || match.length === 0) {
            throw new Error(error);
        }
        return match[1];
    }

    private static resolveImages(text: string, documentPath: string): CardImage[] {
        const IMAGE_REGEX = /!\[(.*?)\]( |\t)*\((.*?)\)/g
        let match: RegExpMatchArray | null;
        const images: CardImage[] = [];
        while ((match = IMAGE_REGEX.exec(text)) !== null) {
            const src = match[match.length - 1];
            images.push({
                src,
                absolutePath: resolveLink(documentPath, src)
            });
        }
        return images;
    }
}