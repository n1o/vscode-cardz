const splitOn = /[ \n]/;

type Token = { startPosition: number, endPosition: number, token: string };
type Entry = { value: string, index: number };

export function LCS(X: Token[], Y: Token[]): number[][] {
    const n = X.length;
    const m = Y.length;

    const L = new Array(n + 1).fill(new Array(m+1).fill(0));
    for (let j = 0; j < n; j++ ) {
        for (let k = 0; k < m; k++){
            if (X[j].token === Y[k].token){
                L[j+1][k+1] = L[j][k] + 1;
            } else {
                L[j+1][k+1] = Math.max(L[j][k+1], L[j+1][k]);
            }
        }
    }
    return L;
}

export function solveLCS(X: Token[], Y: Token[], L: number[][]): Token[] {
    const solution: Token[] = [];
    let j = X.length;
    let k = Y.length;
    try {
        while (L[j][k] > 0 && j - 1 > 0 && k - 1 > 0) {
            if (X[j-1].token === Y[k-1].token) {
                solution.push(X[j - 1]);
                j -= 1;
                k -= 1;
            } else if (L[j-1][k] >= L[j][k-1]) {
                j -= 1;
            } else {
                k -= 1;
            }
        }
    } catch {
        console.log("Error");
    }
    return solution.reverse();
}

export function coverage(main: string, cards: Map<string, string>): Map<string, Token[]> {
    const mainTokens = tokenize(main);
    return new Map([...cards.entries()].map(([k,v]) => {  
        const cardTokens = tokenize(v);
        const grid = LCS(mainTokens, cardTokens);
        const lcs = solveLCS(mainTokens, cardTokens, grid); 
        return [k, sanitizeTokens(lcs)];
    }));
}

export function tokenize(s: string): Token[] {
    let buffer: Entry[] = [];
    const tokens: Token[] = [];
    const letters = s.split('');

    for (let index = 0; index < letters.length; index++) {
        const value: string = letters[index];
        if (value.match(splitOn)) {
            if (buffer.length > 0) {
                tokens.push(getToken(buffer));
                buffer = [];
            }
        } else {
            buffer.push({ index, value });
        }
    }

    if(buffer.length > 0) {
        tokens.push(getToken(buffer));
    }
    return tokens;
}

function getToken(buffer: Entry[]) : Token {
    const head = buffer[0];
    const tail = buffer[buffer.length - 1];
    const token = buffer.map(e => e.value).join("");
    return { startPosition: head.index, endPosition: tail.index, token };
}

function sanitizeTokens(tokens: Token[]): Token[] {
    let last: Token | undefined = undefined;
    const sanitized: Token[] = [];

    for(const token of tokens) {
        if(!last) {
            last = token;
            sanitized.push(token);
        } else if (Math.abs(token.startPosition -  last.endPosition) < 100) {
            last = token;
            sanitized.push(token);
        } else {
            break;
        }
    }
    return sanitized;
}