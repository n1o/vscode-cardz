import { CardInstance, CardsService } from "../../service/cardsService"
const back = `
Some text

![](./images.assets/some.png)
`
describe("Cards service", () => {
    it("should create cards directory", () => {
        const front = "front";
        const rootPath = "/home/mbarak/notes";
        const documentPath = "/home/mbarak/notes/math/simple_note.md";        
        const card = CardInstance.newCard(front, "back", "deck", documentPath);
        
        const serivce = new CardsService(rootPath, ".cards");

        const cardDirecotry = serivce.cardDirectory(card); 

        expect(cardDirecotry).toBe("/home/mbarak/notes/.cards/math/simple_note.md");
    })

    it("should fix image paths for cards", () => {
        const rootPath = "/home/mbarak/notes";
        const documentPath = "/home/mbarak/notes/math/simple_note.md";        
        const card = CardInstance.newCard("front", back, "deck", documentPath);

        const serivce = new CardsService(rootPath, ".cards");

        const fixedCard = serivce.fixImgePath(card);
        console.log(fixedCard);
    });
})