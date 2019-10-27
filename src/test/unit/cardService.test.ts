import "mocha";
import * as chai from "chai";
import { tmpdir } from 'os';
import { promises, fstat } from 'fs';
import { CardService } from "../../service/cardService";
import { join } from "path";
import * as uuidv4 from 'uuid/v4';

const expect = chai.expect;

const simpleCard = `# Bottom-Up heap construction
If we have all the elements of the heap beforehand we can construct the heap in $O(n)$.

![Bottom up](../Heaps.assets/bottom_up.png)`;

const cardWithRelativePath = `# Bottom-Up heap construction
If we have all the elements of the heap beforehand we can construct the heap in $O(n)$.

![Bottom up](Heaps.assets/bottom_up.png)`;

describe("CardService", () => {

    const service = new CardService();
    const deck = "Algorithms";

    it("cardName should get first item in card", () => {

        const cardName = service.cardName(simpleCard);
        expect(cardName).to.be.equal("# Bottom-Up heap construction");
    });

    it("createFlashCard create card", () => {

        const cardName = "# Bottom-Up heap construction";

        const flashCard = service.createFlashCard(simpleCard, cardName, deck);
        expect(flashCard.front).to.be.equal(cardName);
        expect(flashCard.back).to.be.equal(simpleCard);
        expect(flashCard.deck).to.be.equal(deck);
    });

    it("createFlashCard replace image paths", () => {

        const cardName = "# Bottom-Up heap construction";

        const flashCard = service.createFlashCard(cardWithRelativePath, cardName, deck);
        expect(flashCard.back).to.be.equal(simpleCard);
    });

    it("fsCardName to normalize card name", () => {

        const name = CardService.fsCardName({
            front: "# Bottom-Up heap construction",
            back: "",
            deck
        });

        expect(name).to.be.equal("_Bottom_Up_heap_construction.md");
    });
    it("flushCard to write card to disk", async () => {
        const tmpDir = tmpdir();
        const uuid = uuidv4();
        const dir = join(tmpDir, uuid);
        await promises.mkdir(dir);
        const cardPath = join(dir, "_Bottom_Up_heap_construction.md");
        const card = {
            front: "# Bottom-Up heap construction",
            back: simpleCard,
            deck
        };

       await service.flushCard(card, cardPath);

       const stat = await promises.stat(cardPath);

       expect(stat.isFile()).to.be.true;

       const content = (await promises.readFile(cardPath)).toString();
       expect(content).not.to.be.empty;
    });
});