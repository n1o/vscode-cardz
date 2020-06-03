const INLINE_MATH = /\$(.+?)\$/g;
const BLOCK_MATH = /\$\$(.+?)\$\$/g;

const expressionToRemove: RegExp[] = [
    INLINE_MATH, 
    BLOCK_MATH
];

export function sanitizeText(text: string): string {
    let _text = `${text}`;
    let match: RegExpMatchArray | null;

    for (const expression of expressionToRemove) {

        while((match = expression.exec(text)) != null){
            if(match) {
                _text = _text.replace(match[0], "");
            }
        }
    }

    return _text;
}

export function removeBlanks(tokens: string[]): string[] {
    return tokens.filter(t => {
        return !!t.match(/[a-z0-9]/);
    });
}