export interface CardRange {
    start: number;
    end: number;
    cardName: string;
}

const splitOn = /[ ,\n\.]/;

export function coverage(main: string, cards: Map<string, string>): CardRange[] {
    const windowLength = 5;
    const mainTokens = main.split(splitOn).filter(t => t !== "");
    const tokenizedCards = new Map([...cards.entries()].map(([k,v]) =>  [k, new Set(v.split(splitOn).filter(t => t !== ""))]));
    const tokenizedMatch = new Map<string, number[]>([...tokenizedCards.keys()].map(k => [k, []]));
    for (let i = 0; i <=  mainTokens.length - windowLength + 1; i++) {
        for (const [cardName, cardTokens] of tokenizedCards.entries()) {
            const tokensHistory = tokenizedMatch.get(cardName)!;
            tokensHistory.push(mainTokens.slice(i, i + windowLength).filter(i => cardTokens.has(i)).length);
            tokenizedMatch.set(cardName, tokensHistory);
        }
    }

    console.log(tokenizedMatch);

    return [];

}