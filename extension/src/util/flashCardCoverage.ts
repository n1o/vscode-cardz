const splitOn = /[ \n]/;
type Solution = { position: number, value: Token };
type Token = { startPosition: number, token: string };

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

export function solveLCS(X: Token[], Y: Token[], L: number[][]): Solution[] {
    const solution: Solution[] = [];
    let j = X.length;
    let k = Y.length;
    try {
        while (L[j][k] > 0 && j - 1 > 0 && k - 1 > 0) {
            if (X[j-1].token === Y[k-1].token) {
                solution.push({ position: j - 1, value: X[j - 1] });
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

export function coverage(main: string, cards: Map<string, string>): Map<string, Solution[]> {
    const mainTokens = tokenize(main);
    return new Map([...cards.entries()].map(([k,v]) => {  
        const cardTokens = tokenize(v);
        const grid = LCS(mainTokens, cardTokens);
        const lcs = solveLCS(mainTokens, cardTokens, grid); 
        return [k, lcs];
    }));
}

export function tokenize(s: string): Token[] {
    return s.split(splitOn).reduce<Token[]>((acc, token) => {
        if(acc.length === 0) {
            return [{ startPosition: 0, token }];
        } else {
            const tail = acc[acc.length - 1];
            return [...acc, { startPosition: tail.startPosition + token.length + 1, token }];
        }
    }, []).filter(t => t.token !== "");
}
