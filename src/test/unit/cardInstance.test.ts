import { CardInstance } from "../../entity/CardInstance";
import { parentPort } from "worker_threads";
import { exec } from "child_process";

const markdown = `---
Deck: Test
Front: Some start v2
ID: 1590690791575
Tags: tag1,tag2
Back:
---
# Some start

Do not show png?
![](test2.md.assets/image_1.png)

Here to test images:

![](../anotherFolder/some.asset/image2.png)

Here to test image uploads.
`

const expectedBack = `# Some start

Do not show png?
![](test2.md.assets/image_1.png)

Here to test images:

![](../anotherFolder/some.asset/image2.png)

Here to test image uploads.`

describe("Card Instance", () => {
    const documentPath = "/file/parent";
    it("create from raw markdown", () => {
        const instance = CardInstance.fromMarkdown(markdown, documentPath);
        console.log(instance);
        expect(instance.id).toBe("1590690791575");
        expect(instance.front).toBe("Some start v2");
        expect(instance.tags).toEqual(["tag1", "tag2"]);
        expect(instance.back.startsWith("# Some start") && instance.back.endsWith("Here to test image uploads.\n")).toBe(true);
        expect(instance.documentPath).toBe(documentPath);
    });

    it("card name", () => {
        const instance = CardInstance.fromMarkdown(markdown, documentPath);
        expect(instance.cardName).toBe("Some_start_v2.md")
    });

    it("New Card", () => {
        const front = "front";
        const back = "back";
        const deck = "deck";
        const documentPath = "/home/parent";

        const instance = CardInstance.newCard(front, back, deck, documentPath);
        expect(instance.front).toBe(front);
        expect(instance.back).toBe(back);
        expect(instance.documentPath).toBe(documentPath);
        expect(instance.deck).toBe(deck);
    })
})